{
  "targets": [
    {
      "target_name": "addon",
      "sources": [ "native-napi/addon.cc" ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}