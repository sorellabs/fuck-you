#!/usr/bin/env node

var ps       = require('xps');
var Task     = require('data.task');
var Maybe    = require('data.maybe');
var sequence = require('control.monads').sequence;
var sanitise = JSON.stringify;
var toArray  = [].slice.call.bind([].slice);

var chars       = " -_abcdefghijklmnopqrstuvwxyz1234567890";
var flipped     = " -_ɐqɔpǝɟɓɥıɾʞlɯuodbɹsʇnʌʍxʎz⇂zƐㄣϛ9ㄥ860";


main(process.argv, process.pid);


// :: [String], Number -> () *Eff*
function main(args, pid) {
  if (args.length <3) {
    show('Usage: fuck [you] PROCESS_NAME');
    process.exit(1);
  }

  var processName = last(args).get();
  var processes = ps.list();
  var killed = processes.map(function(data) {
    return data.filter(match(pid, processName))
               .map(kill)
  });

  killed.chain(sequence(Task))
    .fork(
      function(e) {
        show('(；￣Д￣) . o O( It’s not very effective... )');
      },
      function(xs) {
        if (xs.length > 0)
          show('(╯°□°）╯︵', flip(processName), ' (x', xs.length, ')');
        else
          show('(；￣Д￣) . o O( I’ve got nothing on ' + processName + '! )');
      }
    );
}


// :: String... -> () *Eff*
function show() {
  console.log('\n ' + toArray(arguments).join('') + '\n');
}


// :: String -> String
function flip(name) {
  return name.toLowerCase()
             .split('')
             .reverse()
             .join('')
             .replace(/./g, function(a) {
                              var i = chars.indexOf(a);
                              return i != -1?  flipped[i]
                              :      /* _ */   '';
                            });
}

// :: { name: String, pid: Number } -> { name: String, pid: Number }
function kill(process) {
  return ps.kill(process.pid)
           .map(function() {
             return process;
           });
}

// :: Number, String -> { name: String, pid: Number } -> Boolean
function match(pid, pattern){ return function(process) {
  return toRegExp(pattern).test(process.name)
  &&     process.pid !== pid;
}}

// :: String -> RegExp
function toRegExp(pattern) {
  return new RegExp('^' + escape(pattern) + '$', 'i');

  function escape(x) {
    return x.replace(/(\W)/g, function(_, match) {
      return match === '*'?   '.*'
      :      /* otherwise */  '\\' + match;
    });
  }
}

// :: [a] -> Maybe(a)
function last(args) {
  return args.length > 0?  Maybe.Just(args[args.length - 1])
  :      /* otherwise */   Maybe.Nothing();
}
