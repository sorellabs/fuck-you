#!/usr/bin/env node

var exec     = require('child_process').exec
var λ        = require('core.lambda')
var Future   = require('data.future')
var sequence = require('control.monads').sequence
var sanitise = JSON.stringify
var toArray  = [].slice.call.bind([].slice)

var chars       = " -_abcdefghijklmnopqrstuvwxyz1234567890"
var flipped     = " -_ɐqɔpǝɟɓɥıɾʞlɯuodbɹsʇnʌʍxʎz⇂ᄅƐㄣގ9ㄥ860"

main(process.argv, process.pid)


// :: [String], Number -> () *Eff*
function main(args, pid) {
  if (args.length < 4) {
    show('Usage: fuck you [process]')
    process.exit(1) }

  var processName = args[3]
  var processes   = shell('pgrep', [processName])
  var toKill      = processes.map(function(data) {
                                    return parseIds(data.output).filter(notEqual(pid))
                                                                .map(kill) })

  toKill.chain(sequence(Future))
        .fork( function(e)  { show('(；￣Д￣) . o O( It’s not very effective... )') }
             , function(xs) { show('(╯°□°）╯︵', flip(processName), ' (x', xs.length, ')') })}


// :: String... -> () *Eff*
function show() {
  console.log('\n ' + toArray(arguments).join('') + '\n') }


// :: String -> String
function flip(name) {
  return name.toLowerCase()
             .split('')
             .reverse()
             .join('')
             .replace(/./g, function(a) {
                              var i = chars.indexOf(a)
                              return i != -1?  flipped[i]
                              :      /* _ */   '' })}


// :: String, [String] -> Future(Error, { output: String, error: String })
function shell(command, args) {
  return new Future(function(reject, resolve) {
                      exec( command + ' ' + args.map(λ.compose(String)(sanitise)).join(' ')
                          , function(error, stdout, stderr) {
                              if (error == null)  resolve({ output: stdout, error: stderr })
                              else                reject(error) })})}


// :: String -> [Number]
function parseIds(text) {
  return text.trim()
             .split(/\s+/)
             .map(Number) }


// :: 'a -> 'a -> Boolean
function notEqual(x){ return function(y) {
  return x !== y }}


// :: Number -> Future(Error, { output: String, error: String })
function kill(pid) {
  return shell('kill', ['-9', pid]) }