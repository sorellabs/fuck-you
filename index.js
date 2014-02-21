#!/usr/bin/env node

if (process.argv.length <3) {
  console.log('Usage: fuck [you] process')
  process.exit(1)
}

var exec     = require('child_process').exec
var sanitise = JSON.stringify
var toArray  = [].slice.call.bind([].slice)

var chars   = " -_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
var flipped = " -_ɐqɔpǝɟɓɥıɾʞlɯuodbɹsʇnʌʍxʎz∀𐐒ƆᗡƎℲ⅁HIſ⋊⅂WNOԀΌᴚS⊥∩ΛMX⅄Z⇂ᄅƐㄣގ9ㄥ860"
var pname   = process.argv[process.argv.length-1]

if (pname === 'you') {
  console.log('I would if I could')
  process.exit(1)
}

exec('killall -9 ' + sanitise(pname), function(error, stdout, stderr) {
  if (error == null)  show('(╯°□°）╯︵', flip(pname))
  else                show('(；￣Д￣) . o O( It’s not very effective... )') }); 


function show() {
  console.log('\n ' + toArray(arguments).join('') + '\n') }

function flip(name) {
  return name.toLowerCase()
             .split('')
             .reverse()
             .join('')
             .replace(/./g, function(a) {
                              var i = chars.indexOf(a)
                              return i != -1?  flipped[i]
                              :      /* _ */   '' })}