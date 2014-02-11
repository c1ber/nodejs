var adb = require('adbkit');
var client = adb.createClient();

client.trackDevices(function(err, tracker) {
  tracker.on('add', function(device) {
    console.log('Device %s was plugged in', device.id);
  });
  tracker.on('remove', function(device) {
    console.log('Device %s was unplugged', device.id);
  });
});