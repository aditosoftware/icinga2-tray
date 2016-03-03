# Icinga2-Tray

## Description

show screenshot in screenshot folder

Icinga2-Tray is a simple app, this can show your the service from icinga2, if this are in warning or error state.

### System requirements

 1. Icinga2 v2.4
 2. Icinga2 API enabled (you can use our [icinga2 docker image](https://hub.docker.com/r/adito/icinga2))
 3. Linux - show requiments for [node-notifier](https://www.npmjs.com/package/node-notifier)

### Configuration
You need to edit config.yml in appdir/resources/app

    {
    "api": {
        "url": "monitoring.example.com",
        "port": 5665,
        "user": "apiUser",
        "pass": "apiUserPass"
    },
        "refreshtime": 120
    }

## Release

Show zip files for your os in Releases