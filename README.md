<<<<<<< HEAD
Clipboard
=========

START UP INSTRUCTIONS BELOW:
=========
A Cadet Attendance and personelle tracking system.

WHAT IS CLIPBOARD?
=========
A clipboard, is the usual symbol of an NCO (Non Comissioned Member, leader) within the Cadet program. They can be identified by metal clipboards carried in their left arm, usually containing all the tools and documents required to function in their leadership roles. Every clipboard, will usually contain the two following documents: attendance sheets, and uniform marking sheets.

The aim of this project, is to digitize and automate that time-honoured leadership artifact, or at-least reduce the amount of paperwork and manual work required to handle unit attendance and personelle tracking.

Currently, weekly attendance, is a time-intensive manual process that takes time away from training and is usually inaccurate. Unit attendance is a crucial reporting requirement within the organization, as attendance determines the amount of resources allotted for future training years etc. This is time intensive because each cadet (or their staff) must find their name in a list of either 30 others, or 150 others dependent upon unit and sub-unit size. If done through a single sign-in point, this creates a bottleneck. If done by flight-staff, on average, 30 seconds is taken up per cadets for attendance. There are usually errors because members are signed-in manually using pen and paper, and because data must be re-entered manually.

Class attendance, is secondary roll call that is taken in each of the classes through-out the unit as a form of error checking. The Administration staff will check both attendance lists to ensure that a cadet was indeed present. However, if a cadet shows up on one and not the other, this creates issues.

If a cadet is going to be sick, they are currently told to inform their supervisors or call-in to the office. If either the supervisor or admin staff do not note the cadet down as excused (which is possible considering how busy staff are on a weekly/nightly basis), the cadet will be noted as “Absent Without Excuse” and will have his/her standings affected.

Clipboard will solve this problem in the following ways:
1.	It will automate and speed up the process by either allowing staff (either with a flight or at a single point) to take in attendance by either:
i.	scanning a cadets barcode (sewn into a uniform part)
ii.	taking a picture of a cadets nametag (and using OCR to process it) 
iii.	or at worst case, allowing cadets to search for their name using a search box and quickly sign-in (using a tablet or computer).
2.	All attendance results will be contained in a single point (database) leading to less errors.
3.	Cadets that are sick, can e-mail into an automated inbox that will mark the cadet down as excused.
4.	When it’s time to enter the attendance into FORTRESS, results can be exported easily into an EXCEL file.


START UP INSTRUCTIONS:
=========
1. DATABASE PASSWORD: Add a file in the parent directory named: dbpassword.txt (I'll message you your db password)
2. To run node (atleast in windows, in directory do : set DEBUG=myapp & node .\bin\www )
=======

# socket.io-client

[![Build Status](https://secure.travis-ci.org/Automattic/socket.io-client.svg)](http://travis-ci.org/Automattic/socket.io-client)
[![NPM version](https://badge.fury.io/js/socket.io-client.svg)](http://badge.fury.io/js/socket.io-client)
![Downloads](http://img.shields.io/npm/dm/socket.io-client.svg)

## How to use

A standalone build of `socket.io-client` is exposed automatically by the
socket.io server as `/socket.io/socket.io.js`. Alternatively you can
serve the file `socket.io.js` found at the root of this repository.

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io('http://localhost');
  socket.on('connect', function(){});
  socket.on('event', function(data){});
  socket.on('disconnect', function(){});
</script>
```

Socket.IO is compatible with [browserify](http://browserify.org/).

### Node.JS (server-side usage)

  Add `socket.io-client` to your `package.json` and then:

  ```js
  var socket = require('socket.io-client')('http://localhost');
  socket.on('connect', function(){});
  socket.on('event', function(data){});
  socket.on('disconnect', function(){});
  ```

## API

### IO(url:String, opts:Object):Socket

  Exposed as the `io` namespace in the standalone build, or the result
  of calling `require('socket.io-client')`.

  When called, it creates a new `Manager` for the given URL, and attempts
  to reuse an existing `Manager` for subsequent calls, unless the
  `multiplex` option is passed with `false`.

  The rest of the options are passed to the `Manager` constructor (see below
  for details).

  A `Socket` instance is returned for the namespace specified by the
  pathname in the URL, defaulting to `/`. For example, if the `url` is
  `http://localhost/users`, a transport connection will be established to
  `http://localhost` and a Socket.IO connection will be established to
  `/users`.

### IO#protocol

  Socket.io protocol revision number this client works with.

### IO#Socket

  Reference to the `Socket` constructor.

### IO#Manager

  Reference to the `Manager` constructor.

### IO#Emitter

  Reference to the `Emitter` constructor.

### Manager(url:String, opts:Object)

  A `Manager` represents a connection to a given Socket.IO server. One or
  more `Socket` instances are associated with the manager. The manager
  can be accessed through the `io` property of each `Socket` instance.

  The `opts` are also passed to `engine.io` upon initialization of the
  underlying `Socket`.

  Options:
  - `reconnection` whether to reconnect automatically (`true`)
  - `reconnectionAttempts` (`Infinity`) before giving up
  - `reconnectionDelay` how long to initially wait before attempting a new
    reconnection (`1000`). Affected by +/- `randomizationFactor`,
    for example the default initial delay will be between 500 to 1500ms.
  - `reconnectionDelayMax` maximum amount of time to wait between
    reconnections (`5000`). Each attempt increases the reconnection delay by 2x
    along with a randomization as above
  - `randomizationFactor(`0.5`), 0 <= randomizationFactor <= 1
  - `timeout` connection timeout before a `connect_error`
    and `connect_timeout` events are emitted (`20000`)
  - `autoConnect` by setting this false, you have to call `manager.open`
    whenever you decide it's appropriate

#### Events

  - `connect`. Fired upon a successful connection.
  - `connect_error`. Fired upon a connection error.
    Parameters:
      - `Object` error object
  - `connect_timeout`. Fired upon a connection timeout.
  - `reconnect`. Fired upon a successful reconnection.
    Parameters:
      - `Number` reconnection attempt number
  - `reconnect_attempt`. Fired upon an attempt to reconnect.
  - `reconnecting`. Fired upon an attempt to reconnect.
    Parameters:
      - `Number` reconnection attempt number
  - `reconnect_error`. Fired upon a reconnection attempt error.
    Parameters:
      - `Object` error object
  - `reconnect_failed`. Fired when couldn't reconnect within `reconnectionAttempts`

The events above are also emitted on the individual sockets that
reconnect that depend on this `Manager`.

### Manager#reconnection(v:Boolean):Manager

  Sets the `reconnection` option, or returns it if no parameters
  are passed.

### Manager#reconnectionAttempts(v:Boolean):Manager

  Sets the `reconnectionAttempts` option, or returns it if no parameters
  are passed.

### Manager#reconnectionDelay(v:Boolean):Manager

  Sets the `reconectionDelay` option, or returns it if no parameters
  are passed.

### Manager#reconnectionDelayMax(v:Boolean):Manager

  Sets the `reconectionDelayMax` option, or returns it if no parameters
  are passed.

### Manager#timeout(v:Boolean):Manager

  Sets the `timeout` option, or returns it if no parameters
  are passed.

### Socket

#### Events

  - `connect`. Fired upon a connection including a successful reconnection.
  - `error`. Fired upon a connection error
    Parameters:
      - `Object` error data
  - `disconnect`. Fired upon a disconnection.
  - `reconnect`. Fired upon a successful reconnection.
    Parameters:
      - `Number` reconnection attempt number
  - `reconnect_attempt`. Fired upon an attempt to reconnect.
  - `reconnecting`. Fired upon an attempt to reconnect.
    Parameters:
      - `Number` reconnection attempt number
  - `reconnect_error`. Fired upon a reconnection attempt error.
    Parameters:
      - `Object` error object
  - `reconnect_failed`. Fired when couldn't reconnect within `reconnectionAttempts`

## License

[MIT](/LICENSE)
>>>>>>> db45b05b12500a34ff8fabc685ad878b65f1e5ef
