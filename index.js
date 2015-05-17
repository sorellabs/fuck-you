#!/usr/bin/env node

var ps       = require('xps');
var Task     = require('data.task');
var Maybe    = require('data.maybe');
var sequence = require('control.monads').sequence;
var sanitise = JSON.stringify;
var toArray  = [].slice.call.bind([].slice);

var chars       = " -_.abcdefghijklmnopqrstuvwxyz1234567890";
var flipped     = " -_'ɐqɔpǝɟɓɥıɾʞlɯuodbɹsʇnʌʍxʎz⇂zƐㄣϛ9ㄥ860";


main(process.argv, process.pid);


// :: [String], Number -> () *Eff*
function main(args, pid) {
  if (args.length <3) {
    console.log('Usage: fuck [you] PROCESS_NAME');
    process.exit(1);
  }

  var pattern   = last(args).get();
  var processes = ps.list();
  var killed    = processes.map(function(data) {
                    return data.filter(match(pid, pattern))
                               .map(kill);
                  });

  killed.chain(sequence(Task)).map(collectUnique).fork(
    function onError(e) {
      console.log('');
      shock('It’s not very effective...');
    },
    function onSuccess(xs) {
      console.log('');
      if (xs.length > 0)
        xs.forEach(function(process){
          rage(flip(process.name), '(x', process.pids.length, ': ', process.pids.join(', '), ')');
        });
      else
        shock('I’ve got nothing on ', pattern);
    }
  );
}


// :: [String] -> () *Eff*
function show(xs) {
  console.log(xs.join('') + '\n');
}

// :: String... -> () *Eff*
function rage() {
  return show(['  (╯°□°）╯︵'].concat(toArray(arguments)));
}

// :: String... -> () *Eff*
function shock() {
  return show(['  (；￣Д￣) . o O( '].concat(toArray(arguments)).concat([' )']));
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

// :: [{ name: String, pid: Number }] -> [{ name: String, pids: [Number] }]
function collectUnique(processes) {
  return processes.reduce(doCollect, []);

  function doCollect(processes, process) {
    return findIndex(processes, function(a){ return a.name === process.name }).cata({
      Nothing: function() {
        return processes.concat([{ name: process.name, pids: [process.pid] }]);
      },
      Just: function(index) {
        var item = processes[index];

        return processes.slice(0, index)
                        .concat([{ name: process.name, pids: item.pids.concat([process.pid]) }])
                        .concat(processes.slice(index + 1));
      }
    });
  }
}

// :: ['a], ('a -> Boolean) -> Maybe(Number)
function findIndex(xs, predicate) {
  for (var i = 0; i < xs.length; ++i) {
    if (predicate(xs[i]))  return Maybe.Just(i);
  }
  return Maybe.Nothing();
}


// :: Number, String -> { name: String, pid: Number } -> Boolean
function match(pid, pattern){ return function(process) {
  return toRegExp(pattern).test(process.name)
  &&     process.pid !== pid;
}}

// :: String -> RegExp
function toRegExp(pattern) {
  return new RegExp((process.platform === 'darwin' ? '^.*/' : '^') + escape(pattern) + '$', 'i');

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
