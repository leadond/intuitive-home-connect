
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get SmartThings platform credentials for the user
    const { data: platforms, error: platformError } = await supabaseClient
      .from('smart_home_platforms')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform_name', 'SmartThings')
      .eq('is_connected', true)
      .single()

    if (platformError || !platforms) {
      console.error('Platform error:', platformError)
      return new Response(
        JSON.stringify({ error: 'SmartThings platform not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const credentials = platforms.credentials as { api_key: string; base_url?: string }
    const baseUrl = credentials.base_url || 'https://api.smartthings.com/v1'

    // Fetch devices from SmartThings API
    const devicesResponse = await fetch(`${baseUrl}/devices`, {
      headers: {
        'Authorization': `Bearer ${credentials.api_key}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!devicesResponse.ok) {
      const errorText = await devicesResponse.text()
      console.error('SmartThings API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch devices from SmartThings', details: errorText }),
        { status: devicesResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const smartThingsData = await devicesResponse.json()
    const devices = smartThingsData.items || []

    console.log(`Fetched ${devices.length} devices from SmartThings`)

    // Store or update devices in our database
    for (const device of devices) {
      // Fetch device status for more accurate data
      let deviceStatus = {}
      try {
        const statusResponse = await fetch(`${baseUrl}/devices/${device.deviceId}/status`, {
          headers: {
            'Authorization': `Bearer ${credentials.api_key}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          // Extract main component status
          if (statusData.components && statusData.components.main) {
            deviceStatus = statusData.components.main
          }
        }
      } catch (statusError) {
        console.error(`Error fetching status for device ${device.deviceId}:`, statusError)
      }

      // Determine device type from capabilities
      let deviceType = device.type?.toLowerCase() || 'unknown'
      if (device.components && device.components[0] && device.components[0].capabilities) {
        const capabilities = device.components[0].capabilities
        if (capabilities.some((cap: any) => cap.id === 'switch' || cap.id === 'switchLevel')) {
          deviceType = capabilities.some((cap: any) => cap.id === 'switchLevel') ? 'dimmer' : 'switch'
        } else if (capabilities.some((cap: any) => cap.id === 'lock')) {
          deviceType = 'lock'
        } else if (capabilities.some((cap: any) => cap.id === 'thermostat')) {
          deviceType = 'thermostat'
        } else if (capabilities.some((cap: any) => cap.id === 'audioVolume')) {
          deviceType = 'speaker'
        }
      }

      // Get room name from location
      let roomName = null
      if (device.roomId) {
        try {
          const roomResponse = await fetch(`${baseUrl}/locations/${device.locationId}/rooms/${device.roomId}`, {
            headers: {
              'Authorization': `Bearer ${credentials.api_key}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          })
          
          if (roomResponse.ok) {
            const roomData = await roomResponse.json()
            roomName = roomData.name
          }
        } catch (roomError) {
          console.error(`Error fetching room for device ${device.deviceId}:`, roomError)
        }
      }

      const deviceData = {
        user_id: user.id,
        platform_id: platforms.id,
        device_id: device.deviceId,
        device_name: device.name || device.label || `${device.deviceTypeName || 'Device'} ${device.deviceId.slice(-4)}`,
        device_type: deviceType,
        room: roomName,
        status: deviceStatus,
        capabilities: device.components || {},
        last_updated: new Date().toISOString()
      }

      // Upsert device (insert or update if exists)
      const { error: upsertError } = await supabaseClient
        .from('smart_home_devices')
        .upsert(deviceData, {
          onConflict: 'user_id,device_id'
        })

      if (upsertError) {
        console.error('Error upserting device:', upsertError)
      }
    }

    // Update platform last_sync timestamp
    await supabaseClient
      .from('smart_home_platforms')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', platforms.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        devices_synced: devices.length,
        message: `Successfully synced ${devices.length} devices from SmartThings`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
