var util = require('util');
var path = require('path');
var hfc = require('fabric-client');

hfc.setConfigSetting('network-connection-profile-path',path.join(__dirname, 'artifacts' ,'network-config.yaml'));
hfc.setConfigSetting('Org1-connection-profile-path',path.join(__dirname, 'artifacts', 'org1.yaml'));
hfc.addConfigFile(path.join(__dirname, 'config.json'));
