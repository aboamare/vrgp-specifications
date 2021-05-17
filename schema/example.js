/*
 * An annoted example of a vessel JSON document.
 *
 * Written as a Javascript file to enable annotations.
 * 
 */

const vessel =  // this line is here to make the file valid Javascript

{
  "name": "AboaMare Spirit",
  "mmsi": "999111222",
  "mrn": "uri:mrn:mcp:vessel:aboamare:spirit",  // optional
  "imo": "0000111",                             // optional
  "call": "ABOASP",                             // optional

  // dimensions in meters
  "loa": 50.0,
  "breadth": 10.0,
  "height": 20.0,

  // draft can also be a single number, and then it is the actual draft, in the current location (water density), in meters.
  "draft": {
    "foreward": 5.6,  // actual
    "aft": 5.5,       // actual
    "summer": 7.4     // registered summer draft, i.e. the maximum allowed draft in summer sea water.
  },

  // outlines as SVG paths
  "from_above": "M 5 0 L 10 7 L 10 48 L 5 50 L 0 48 L 0 7 Z",
  "from_abaft": "M 5 20 Q 0 20 0 19 L 0 11 L 2 11 L 2 5 L 0 5 L 0 3 L 4.5 3 L 4.5 0 L 5.5 0 L 4.5 3 L 10 3 L 10 5 L 8 5 L 8 11 L 10 11 L 10 19 Q 10 20 5 20",

  /*
   * steering mechanism(s) are given here. In the simplest case of a single 
   * rudder the only required properties are 'type', 'set' and 'actual'.
   * In case of multiple rudders (or other mechanisms), each mechanism is given as an object with a 'type'
   * and identified by a key. It is recommended to use common names for the keys, such as "port", "sb", etc.
   */
  "steering": {
    "modes": ["sync", "independent", "emergency"], //optional, default is ["sync", "emergency"] in case of multiple rudders (or pods)
    "mode": "sync",
    "port": {
      "type": "rudder",
      "range": [-35, 35, 1],   // optional, max degrees to port and starboard. Default for 'rudder' type is [-45, 45]. The third number is the stepsize.
      "set": -10,       // requested rudder angle, in degrees. Negative values indicate port helm (the trailing edge of the rudder is to port)
      "actual": 6       // actual current rudder angle
    },
    "sb": {
      "type": "rudder",
      "range": [-35, 35, 1],
      "set": -10,
      "actual": 6
    }
  },

  /*
   * As with steering, propulsion systems can be given as keyed separate entries, or as a single object.
   */
  "propulsion" : {
    "port": {
      "type": "cpp", // controllable pitch propeller
      "dor": "right", //optional direction of rotation, "right" for clockwise as seen from abaft when going forward, which is the default.
      "range": [-100, 100, 5], // optional, for cpp pitch is given and controlled as percentage of range of actual pitch, the third value is the step size
      "set": 65,
      "actual": 65,
      "rpm": 133  // optional for a cpp
    },
    "sb": {
      "type": "cpp", // controllable pitch propeller
      "range": [-100, 100, 5], // optional, for cpp pitch is given and controlled as percentage of range of actual pitch, the third value is the step size
      "set": 65,
      "actual": 65,
      "rpm": 133  // optional for a cpp
    }
  },

  /*
   * The systems of the vessel that can be controlled. Each key identifies a 
   * list of entry points in this vessel document, in "dot path" notation.
   * 
   * Control has to be acquired (and released) using the key. So to steer
   * this vessel the "conning" has to be acquired and then the controller
   * can adjust the 'steering.set', the 'propulsion.port.set', and the 
   * 'propulsion.sb.set' value.
   * The '.set' is not included in the list of controls as it is to be inferred 
   * from the type of controlled system.
   * Likewise the '.set' is implicit in command messages. So to change
   * rudder angle of all rudders of a vessel it can be sufficient to send:
   * 
   *    {command: {steering: 12}}
   * 
   * which could be interpreted as:
   * 
   *    {command: {
   *      steering: {
   *        port: {
   *          set: 12
   *        },
   *        sb: {
   *          set: 12
   *        }
   *      }
   *    }
   */
  "controls": {
    "conning": ["steering", "propulsion.port", "propulsion.sb"]
  },

  // actual conning info
  "lat": 60.00234,    // decimal degrees
  "long": 21.65432,
  "position": { // optional info about accuracy etc.
    "hdop": 3,          // optional horizontal dilution of position, lower is better,
    "accuracy": ">10",  // optional, number in meters, possibly prececed by ">" or "<"
    "source": "GNSS"    // optional
  },
  "heading": 23,    // true heading of the ship, in degrees, as integer or float, and without leading zero. Values from 0 (North) to 359.
  "magnetic": 15,   // optional. Magnetic heading.
  "cog": 14,        // course over gound.
  "rot": 2,         // actual rotation in degrees per minute
  "stw": 13.4,      // forward (longitudal) speed through the water, in knots. Negative numbers for reverse motion.
  "stwBow": 0.0,    // transverse speed through the water at the bow, in knots. Negative values indicate movement to port.
  "stwStern": 0.0,  // transverse speed through the water at the stern, in knots. Negative values indicate movement to port.
  "sog": 12.3,      // speed over ground, in knots.
  "sogBow": 0.0,    // transverse speed over ground at the bow, in knots. Negative values indicate movement to port.
  "sogStern": 0.0,  // transverse speed over ground at the stern, in knots. Negative values indicate movement to port.
  "aws": 4.5,       // apparent (relative) wind speed in knots
  "awa": 56,        // apparent (relative) wind angle from bow
  "tws": 3.2,       // true ("theoretical") wind speed in knots
  "twa": 110,       // true ("theoretical") wind angle from bow
  "depth": 14.3,    // depth under keel
  "depthFore": 14.3,    // depth under keel close to the bow
  "depthAft": 14.3,    // depth under keel close to the stern
  "destination": {
    "name": "Turku",    // name or code of destination port
    "code": "FI TKU",   // internation port code
    "eta": "2021-05-31T16:30:00Z" // estimated time of arrival
  },
  "navigationalStatus": "under way using engine",

  "targets": [ // a list with object just like vessels, but those will not have streams, targets, controls, etc.
    {
      "name": "TUTKTUK",
      "mmsi": "234567890",
      "loa": 25,
      "breadth": 9,
      "lat": 60.0023,
      "long": 20.1002, 
    }
  ],
  "streams": {

  }
}