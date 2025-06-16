
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the session/user from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { deviceId, command, value } = await req.json()

    console.log(`Controlling device ${deviceId} with command ${command}:`, value)
    console.log(`User ID: ${user.id}`)

    // Get the device details from our database - try both with and without user_id filter
    let { data: device, error: deviceError } = await supabaseClient
      .from('smart_home_devices')
      .select(`
        *,
        smart_home_platforms(*)
      `)
      .eq('id', deviceId)
      .single()

    // If not found, log more details for debugging
    if (deviceError || !device) {
      console.error('Device lookup error:', deviceError)
      
      // Try to find device without user filter to see if it exists
      const { data: allDevices } = await supabaseClient
        .from('smart_home_devices')
        .select('id, user_id, device_name')
        .eq('id', deviceId)
      
      console.log('Device search results:', allDevices)
      
      return new Response(
        JSON.stringify({ error: 'Device not found or access denied', details: deviceError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user owns this device
    if (device.user_id !== user.id) {
      console.error(`User ${user.id} does not own device ${deviceId} (owned by ${device.user_id})`)
      return new Response(
        JSON.stringify({ error: 'Device access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get SmartThings credentials
    const platform = device.smart_home_platforms
    if (!platform || platform.platform_type !== 'SmartThings' || !platform.credentials?.access_token) {
      console.error('SmartThings platform not configured or missing credentials')
      return new Response(
        JSON.stringify({ error: 'SmartThings not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const accessToken = platform.credentials.access_token
    const smartThingsDeviceId = device.external_device_id

    if (!smartThingsDeviceId) {
      console.error('Device missing external_device_id')
      return new Response(
        JSON.stringify({ error: 'Device not properly configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare the SmartThings API command
    let smartThingsCommand: any = {}

    switch (command) {
      case 'switch':
        smartThingsCommand = {
          commands: [{
            component: 'main',
            capability: 'switch',
            command: value === 'on' ? 'on' : 'off'
          }]
        }
        break

      case 'switchLevel':
        smartThingsCommand = {
          commands: [{
            component: 'main',
            capability: 'switchLevel',
            command: 'setLevel',
            arguments: [parseInt(value)]
          }]
        }
        break

      case 'lock':
        smartThingsCommand = {
          commands: [{
            component: 'main',
            capability: 'lock',
            command: value === 'locked' ? 'lock' : 'unlock'
          }]
        }
        break

      case 'thermostatSetpoint':
        smartThingsCommand = {
          commands: [{
            component: 'main',
            capability: 'thermostatHeatingSetpoint',
            command: 'setHeatingSetpoint',
            arguments: [parseInt(value)]
          }]
        }
        break

      default:
        console.error('Unsupported command:', command)
        return new Response(
          JSON.stringify({ error: 'Unsupported command' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    console.log('Sending command to SmartThings:', smartThingsCommand)

    // Send command to SmartThings API
    const smartThingsResponse = await fetch(
      `https://api.smartthings.com/v1/devices/${smartThingsDeviceId}/commands`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(smartThingsCommand)
      }
    )

    if (!smartThingsResponse.ok) {
      const errorText = await smartThingsResponse.text()
      console.error('SmartThings API error:', smartThingsResponse.status, errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to control device', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Device command sent successfully')

    // Wait a moment for the device to respond, then fetch updated status
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Fetch updated device status from SmartThings
    const statusResponse = await fetch(
      `https://api.smartthings.com/v1/devices/${smartThingsDeviceId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    let updatedStatus = device.status
    if (statusResponse.ok) {
      const statusData = await statusResponse.json()
      console.log('Updated device status from SmartThings:', statusData)
      
      // Extract the status from SmartThings format
      if (statusData.components?.main) {
        const mainComponent = statusData.components.main
        updatedStatus = {
          ...device.status,
          switch: mainComponent.switch?.switch?.value,
          level: mainComponent.switchLevel?.level?.value,
          lock: mainComponent.lock?.lock?.value,
          temperature: mainComponent.temperatureMeasurement?.temperature?.value,
          thermostatSetpoint: mainComponent.thermostatHeatingSetpoint?.heatingSetpoint?.value,
          thermostatMode: mainComponent.thermostat?.thermostatMode?.value
        }
      }
    }

    // Update the device status in our database
    const { error: updateError } = await supabaseClient
      .from('smart_home_devices')
      .update({ 
        status: updatedStatus,
        last_updated: new Date().toISOString()
      })
      .eq('id', deviceId)

    if (updateError) {
      console.error('Error updating device status:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Device controlled successfully',
        status: updatedStatus
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error controlling device:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
