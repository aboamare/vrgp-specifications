# Vessel Remote Guidance Protocol Specification *Draft* 0.1.0

## Contributors

* Robert J. Aarts, AboaMare Ltd & Novia University of Applied Sciences, robert.aarts@novia.fi

Want to contribute? Read [CONTRIBUTING](./CONTRIBUTING.md)!

## Introduction

There are various scenarios where a distant party, typically but not necessarily ashore, has an interest to obtain accurate, and detailed, information about a ship reliably and in real-time with the purpose of advising the ship in navigation. Examples include, but are not limited to, remote piloting of crewed ships, remote control of autonomous ships, disaster avoidance, etc. Commonly used procedures and technology are limited in detail (VHF verbal comms, AIS), reliability, and timeliness(AIS). However, the digitalization of bridge equipment had resulted in the availability of a wide variety of rich information, but _at the ship_. 
Propietary solutions to export some of that information to shore-based stations exist, but due to their propietary nature these are not suitable for maritime operators other then the owner (shipping company) or certain suppliers of the shipping company (as in e.g. engine diagnostics). Likewise there have of course been propietary, or ad-hoc, means to send control commands from ashore to a vessel as in e.g. remotely controlled scale models.

This specification then defines protocols, and protocol parameters, to securely expose accurate, detailed, bridge information in real-time to trusted distant parties. Any shipyard, bridge equipment provider, shipping company or maritime operator can implement support for the protocols specified here. Similarly this specification defines protocols and messages to securely send (navigation) messages to vessels. Note however, that this specification does **not** provide any guidance as to how the vessel or its Master are to process such advice. 

Whereas this document should be treated as the normative reference for the protocols described, the accompanying reference implementations should be seen as non-normative, informal, "best-effort" interpretations of this specification. However, these implementations can be used as a basis for formalized compliancy testing. It is envisioned that ship classification companies will engage in such compliancy tests and then maritime operators should use only certified implementations in actual operations.

### Related work and standards
The protocols specified here build upon exisiting standards, the aim is to enable implementations built using well-tested, freely available components as much as possible.
Standards of particular relevance include: 
* *NMEA*, for the message format of bridge information
* *Asterix* for radar signals
* general internet standards including, but not limited to, *HTTP*, *WebRTC* and *WebSockets*, and *AV1*
* the Maritime Identity Registry[MRI] of the [*Maritime Connectivity Platform*](https://maritimeconnectivity.net/)

## System architecture

This **informative** section outlines how the protocol specifications are intended to be used by the various parties. This short overview also serves to delineate the scope.

The *Vessel* is expected to contact a *Maritime Operating Centre* (abbrev *MOC*) whenever it (or its crew) decides there is reason to do so. Also, it is foreseen that in the future authorities may require vessels that enter certain designated areas to contact a prescribed MOC, not unlike current requirements to contact a VTS, or request a pilot. In any case the first step (step 1) is for the Vessel to inform a MOC of its readiness and capabilities for remote operations, and optionally of its need for guidance. The MOC acts as a server and acknowledges the message (1) of the Vessel. During this phase the Vessel and the MOC establish a communication channel.

If and when deemed apprpriate the MOC will, using this communication channel, request the Vessel to start streaming one or more *sources* (step 2) of onboard information, taking into account the needs of both the Vessel as well as the MOC. The onboard information sources that the Vessel can convey to the MOC will always include the current navigational data (_conning_ information), such as the position, heading, speed, rate of turn, etc. Vessels may also be able to stream a live radar signal, and signals from video cameras.

In case a Vessel requested guidance the MOC can send advisory messages (step 3) through the communications channel that was set up in step 1.

Either the Vessel or the MOC can at any point decide to end the communication, and are expected to do so in an orderly manner through specified messages (step 4) send through the communications channel.

The whole process is similar to a video call, with possibly camera and screen sharing, between two persons each with a computer. Where e.g. Person V uses a chat facility to let person M know that she can be called, and how. Person M then calls V who has her microphone and camera enabled, and upon request from M (in the chat) shares a window of her screen. In this analogy "microphone" maps to conning info, camera to a video and the shared window to e.g. a radar signal. Note that M "is on mute", but continues to communicate using the chat facility, e.g. to help her out. And either V or M can "hang up", i.e. end the call, but will chat about that intention before they do so.

The architecture then relies on recently developed, but well-established, protocols for remote, internet-based, video calls and similar real-time streamed data. Briefly (again, this is informative) as follows:

  1. The Vessel opens a **web socket** to the **HTTP server** operated by the MOC, and uses the socket to send messages to the MOC, notably the message to inform the MOC about its capabilities.

  2. The MOC can request the Vessel to open a **WebRTC connection** for one or more of the data sources of the Vessel. So in addition to acting as the signalling server the MOC is now also a _WebRTC peer_ of the Vessel. The peer and signalling server don't have to be the same machine, or on the same IP address, but should be part of the same (legal) organization.

  3. The MOC may send advisory messages through the web socket.

  4. The Vessel or MOC inform the other party about the intent to "hang up" with a message through the web socket.

The HTTP, Web Socket and WebRTC standards already specificy most of the important lower-level connectivity aspects including, but not limited to, negotiation of the best bit-rate (and e.g. video resolution), upgrading/downgrading live connections, end-to-end message integrity and other basic security, etc. Nevertheless the Vessel and MOC need to be in agreement on how to use these technologies _exactly_ to ensure flawless interoperability. That agreement is the scope of this specification.

## Scope

The scope of this specification is to precisely define the _use_ of a suite of existing (web) API and protocol specifications to ensure interoperability between a Vessel and a MOC where the Vessel wishes to provide the MOC with real-time rich data so that an MOC can provide navigational advice to a Vessel. 

The protocols that will be used include HTTP, Web Socket and WebRTC, and of course to some degree the protocols that these depend on. Some _examples_ of what this specifiation needs to address include: 

- ensure that the Vessel communicates with a trustworthy MOC.
- establish a standard naming of data sources, to indicate e.g. the onboard position of a video camera.
- the various sources will require different types of WebRTC connections, these types and their parameters need to be specified; including e.g. video codecs that should be used.
- the structure and content of the signalling and navigational messages.


## Definitions
- *Vessel* the party that provides one or more streams of real-time data to a MOC.
- *MOC*, the Maritime Operation Center, requests *data from* vessels and provides *advice to* vessels.
- *MMSI*, a Marine Mobile Service Identifier as specified in [M.585-8].


## 1. Signalling protocol

### Registration
Vessels register with a MOC in two steps: first the vessel opens a WebSocket to the MOC, and then it sends a message with its status and capabilities.

Discovery of the URL of the endpoint for registration with the MOC is out of the scope of this specification. However the last part of the path of the URL SHOULD be used to convey the MMSI of the vessel. For example the URL could be:

wss://amoc.aboamare.com/[mmsi] so a vessel with 

The MOC endpoint MUST BE secure, i.e. the endpoint MUST support the secure web socket protocol, and the protocol part of the url MUST be "wss" [RFC8307]. The MOC SHOULD offer the registration endpoint on port 443.

The Web Socket implementation used by the vessel MUST verify the TLS certificate presented by the MOC, and refuse to connect if the certificate is not valid. It is RECOMMENDED that vessel software is configured to accept only certificates issued by Certificate Authorities that are explicitly configued as such, and for which the root (or intermediate) certificates have been obtained in a secure manner (out-of-band).

As soon as the web socket is open the vessel MUST send a message (see below) with:
- *vessel* information
- *navigation status* report
- *capabilities* for real-time connections, and possibly ship control
- requested *guidance*

The vessel then MUST send a navigation status message at least every 5 seconds, but not more frequently then every 2 seconds.
Message with capabilities and request for advice, and both an up-to-date AIS status report (AIS message type 1 or 3) as well as an AIS static data message (AIS message type 5)
Vessel sends regular updates with position, cog, sog, heading? and status, ais message or nmea messages
MOC request to open WebRTC connections, ice, offers (conning, radar, etc.)
Hang-up

## 2. Messages
All messages are such that they do *not* follow a request/response pattern, each message essentially provides the other party with information. The "request" and "control" messages are slightly different in that for those messages the sender (a MOC) expects the recipient (a vessel) to _react_, albeit not necessarily with a "response" message.

Messages are defined and sent in [JSON] format. One or more messages can be sent in a single JSON object. If a JSON object contains more than one message, the order in which those messages are processed cannot be guaranteed.

  A single message MUST be sent as:
  ```
  {
    "message name": message_content
  }
  ```

  Mulitple MAY be sent as:
  ```
  {
    "message 1 name": message_1_content,
    "message 2 name": message_2_content,
    "message 3 name": message_3_content
  }
  ```

  Where _message name_ is one of the messages defined in the subsequent sections and _message_content_ is a JSON number, string, arrray, or object, as defined for each message. 
  
  Here an example with three messages, "capabilities", "guidance", and "nmea":
  ```
  {
    "capabilities": {
      "conning": {
        "formats": [
          "nmea"
        ]
      },
      "camera0": {
        "position": {
          "fromBow": 20,
          "fromPort": 5,
          "aboveKeel": 10
        },
        "azimuth": [
          -60,
          60
        ],
        "elevation": [
          -70,
          50
        ]
      }
    },
    "guidance": "recommendation",
    "nmea": "!AIVDO,1,1,,B,25Cjtd0Oj;Jp7ilG7=UkKBoB0<06,0*62"
  }
  ```


#### vessel
The _vessel_ message is used to convey information about the vessel that requests guidance. This includes a.o dimensions, cargo, etc. Most, if not all, of this information is "static", in that it could be known and published at the start of the sailing. A _vessel_ message therefor MUST be __either__ a string with a URL pointing to a publicly available JSON document with a vessel object, __or__ such an object. The vessel object (in the message or JSON document) has the following properties:  

__mmsi__ the object MUST have an _mmsi_ property with the Martime Mobile Service Identifier[MMSI] string of the vessel.

__call__ the object SHOULD have a _call_ property which value SHOULD be the international radio call sign assigned to the vessel.

__name__ the object SHOULD have a _name_ property with the name of the vessel as visible on the vessel.

__loa__ the object MUST have a _loa_ property with the overall length of the vessel, in meters, rounded to one decimal.

__width__ the object MUST have a _width_ property with the overall width of the vessel (the _SOLAS breadth_), in meters, rounded to one decimal.

__height__ the object MUST have a _height_ property with the overall height of the vessel, in meters, rounded to one decimal. The height is measured from the keel to the top of the vessel, including masts, antennas and other appendages.

__draft__ the object MUST have a _draft_ property with either a single number representing the average draft or an object with both a _forward_ as well as an _aft_ property with the current drafts at those positions. The draft reported here in the _vessel_ message SHOULD represent the draft for the current voyage and cargo. If the voyage covers various types of water, the reported draft should be the summer temperate sea water draft. Drafts shall be given in meters, rounded to one decimal.

__from_above__ the object SHOULD have a _from_above_ property with as content a string with the drawing commands of an SVG ```<path>``` element[SVG], such that the outline of the defined path corresponds with the outline of the vessel as seen from above. The coordinates of the points shall be in meters. The port side of the vessel SHOULD be aligned with the 0 value of the SVG x-ax, and the bow of the vessel SHOULD be aligned to the 0 value on the SVG y-ax. 

_Informally_, the ship should be pointing up/North. For example, a ship with a length of 50m and a width of 10m could report:
```
{
  "vessel": {
    ...,
    "loa": 50.0,
    "width" 10.0,
    "from_above": "M 5 0 L 10 7 L 10 48 L 5 50 L 0 48 L 0 7 Z",
    ...,
  }
}
```
Here, the bow is at 5,0 (X at half the width, and Y at 0), and the stern at 5,50. This could look like: 

![Vessel from above](./images/from_above_path.svg)

A more accurate outline can be provided by using the commands to draw Bézier curves. For the same vessel the ```"from_above"``` could be given as ```"M 5 0 Q 10 3 10 7 L 10 48 Q 10 50 5 50 Q 0 50 0 48 L 0 7 Q 0 3 5 0"```, which renders as e.g.:

![Vessel from above with curves](./images/from_above_path_with_curves.svg)

__from_above__ the object SHOULD have a _from_abaft_ property with as content a string with the drawing commands of an SVG ```<path>``` element[SVG], such that the outline of the defined path corresponds with the outline of the vessel as seen from abaft (behind). The coordinates of the points shall be in meters. The port side of the vessel SHOULD be aligned with the 0 value of the SVG x-ax, and the highest point of the vessel SHOULD be aligned to the 0 value on the SVG y-ax.

For example, a ship with a length of height of 20m and a width of 10m could report:
```
{
  "vessel": {
    ...,
    "height": 20.0,
    "width": 10.0,
    "from_abaft": "M 5 20 Q 0 20 0 19 L 0 11 L 2 11 L 2 5 L 0 5 L 0 3 L 4.5 3 L 4.5 0 L 5.5 0 L 4.5 3 L 10 3 L 10 5 L 8 5 L 8 11 L 10 11 L 10 19 Q 10 20 5 20",
    ...,
  }
}
```
In this example the SVG drawing commands start at the keel at 5,20 (5 meters from port and 20 meters from the top most point) and then proceed clockwise. This could be rendered as:

![Vessel from abaft](./images/from_abaft_path.svg)

#### capabilities
#### guidance
#### nmea
#### sk
#### predictor?
#### route
#### time
The _time_ message is meant to determine the latency of the connection, by comparing the time that the message was received with the send time of the message.

The message content MUST be an object with a property "sent" with as value the integer number of milliseconds since the Unix epoch at the moment the message was sent (created). 
A recipient of a time message with only a "sent" property SHOULD as soon as possible send a copy of the message with an added "received" property that should be set to the integer number of milliseconds since the Unix epoch at the moment the message was received (processed).

It is RECOMMENDED that a MOC regurlarly sends a time message to the vessel in order to keep track of latency. The vessel will then react to a time message by sending a time message with both a sent as well as a received property. The difference between the "received" and "sent" values is the number of milliseconds it took for the message to travel from the MOC to the vessel message processor. The difference between the moment the MOC receives the message from the vessel, and the "received" value represents the time it took for the message to travel from the vessel to the MOC message processor.

A party SHOULD NOT send a _time_ message more frequently than once per 5 seconds.

Vessels and MOCs SHOULD synchronize their clocks (of the systems involved) to a high precision source such as a GNSS.

**NOTE**: In training and other scenarios the use of computer simulated vessels is common, and a simulation may on purpose be setup to have a completely different time, i.e. at night, or in winter, etc. In such situations the MOC may choose to synchronize to the vessel (or simulator) time. A simulated vessel MUST include the **simulated** flag in its **vessel** (registration) message.

**IMPLEMENTATION CONSIDERATION**: It is envisioned that relatively simply, but useful, implementations of the vessel side of this specification can be constructed as mobile phone applications. Implementors of such are encouraged to pay close attention to clock synchronization. Mobile phones often synchronize to a mobile network provided time which can be several hundreds of milliseconds off, as compared to GNSS time. The vessel is very lilkely to have a reliable GNSS source, and the appplication could use that time source to adjust time messages, or indeed the clock of the phone.

Here is an example of an exchange of time messages:
  
  1. a MOC sends a time message: ```{"time": {"sent": 1608550017650}}```

  2. the vessel receives this 30ms later and sends: ```{"time": {"sent": 1608550017650, "received": 1608550017680}}```

  3. which the MOC receives e.g. 10ms later, at 16085500176**90**. The MOC can now compute the overall round trip and adopt its actions accordingly. The overall roundtrip latency is the difference between the value of the _sent_ property and the time when the message with the _received_ property was received. In the example above this is 16085500176**90** - 16085500176**50**, or 40 ms. 
  
  If, but only if, the clocks of the MOC and vessel are synchronized at millisecond precision can the the latencies in both directions be determined from the differences between _received_ and _sent_, and between the reception time and _received_. 

Of course the vessel may also initiate this sequence.

#### request


## 4. Real-time connections

### 4.1. conning
A stream of mainly fairly standard, well-established, messages in e.g. NMEA or Signal K (delta) format, following the Signal K data model.
In addition perhaps a few additional or "new" messages for e.g.:

#### 4.1.1 predictor?

### 4.3.radar

### 4.4 video

### 4.5 audio?


## 3. Navigation messages

### 3.1 conning (from Vessel to MOC)

### 3.2 advice (from MOC to Vessel)


## 4. Security considerations


## 5. Implementation considerations


## 6. References

[RFC2119]
  [Key words for use in RFCs to Indicate Requirement Levels](https://www.rfc-editor.org/rfc/rfc2119.txt), S. Bradner. The Internet Society, March 1997.

[RFC8307]
  [Well-Known URIs for the WebSocket Protocol](https://tools.ietf.org/html/rfc8307), C. Bormann, Universitaet Bremen TZI, January 2018.

[M.585-8]
  [Recommendation ITU-R M.585-8, Assignment and use of identities in the
maritime mobile service (10/2019)](https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.585-8-201910-I!!PDF-E.pdf)

[MRI]
   Maritime Identity Registry of the [Maritime Connectivity Platform](https://maritimeconnectivity.net/)
  
[SVG]
  [Scalable Vector Graphics (SVG) 1.1 (Second Edition)](https://www.w3.org/TR/2011/REC-SVG11-20110816/)