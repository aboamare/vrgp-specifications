# Vessel Remote Guidance Protocol Specification *Draft* 0.1.0

* Robert J. Aarts, October 2021


## Abstract

This document specifies a protocol by which a vessel can aks for guidance from a remote (shore-based) party in an interoperable manner. The remote party can ask such a vessel to share (near) real-time information. The protocol is stacked upon widely supported internet and web-based technologies and specifications to ensure a low barrier for implementations.

## Status of This Memo

This document is an intial draft, intended for discussion and trial implementations. Input is currently provided in meetings of a work group in the [Sea 4 Value - Fairway](https://www.dimecc.com/dimecc-services/s4v/) project, but also by other experts and organizations. 

Want to **contribute**? Read [CONTRIBUTING](./CONTRIBUTING.md)!

## Copyright Notice

Once this memo is submitted to an actual standards body the copyright might change. Until then this work is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

## Table of Contents

  1. [Introduction](#1-introduction)
    
      1.1. [Related work and standards](#11-related-work-and-standards)
  
  ...
  
  ...

## 1. Introduction

There are various scenarios where a distant party, typically but not necessarily ashore, has an interest to obtain accurate, and detailed, information about a ship reliably and in real-time with the purpose of advising the ship in navigation. Examples include, but are not limited to, remote piloting of crewed ships, remote control of autonomous ships, disaster avoidance, etc. Commonly used procedures and technology are limited in detail (VHF verbal comms, AIS), reliability, and timeliness(AIS). However, the digitalization of bridge equipment had resulted in the availability of a wide variety of rich information, but _at the ship_. 
Propietary solutions to export some of that information to shore-based stations exist, but due to their propietary nature these are not suitable for maritime operators other then the owner (shipping company) or certain suppliers of the shipping company (as in e.g. engine diagnostics). Likewise there have of course been propietary, or ad-hoc, means to send control commands from ashore to a vessel as in e.g. remotely controlled scale models.

This specification then defines protocols, and protocol parameters, to securely expose accurate, detailed, bridge information in real-time to trusted distant parties. Any shipyard, bridge equipment provider, shipping company or maritime operator can implement support for the protocols specified here. Similarly this specification defines protocols and messages to securely send (navigation) messages to vessels. Note however, that this specification does **not** provide any guidance as to how the vessel or its Master are to process such advice. 

Whereas this document should be treated as the normative reference for the protocols described, the accompanying reference implementations should be seen as non-normative, informal, "best-effort" interpretations of this specification. However, these implementations can be used as a basis for formalized compliancy testing. It is envisioned that ship classification companies will engage in such compliancy tests and then maritime operators should use only certified implementations in actual operations.

### 1.1. Related work and standards
The protocols specified here build upon exisiting standards, the aim is to enable implementations built using well-tested, freely available components as much as possible.
Standards of particular relevance include: 
* *NMEA*, for the message format of bridge information
* *Asterix* for radar signals
* general internet standards including, but not limited to, *HTTP*, *[WebRTC]* and *[WebSocket]*, and *[AV1]*
* the Maritime Identity Registry[MIR] of the [*Maritime Connectivity Platform*](https://maritimeconnectivity.net/)

### 1.2. System architecture

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

### 1.3. Scope

The scope of this specification is to precisely define the _use_ of a suite of existing (web) API and protocol specifications to ensure interoperability between a Vessel and a MOC where the Vessel wishes to provide the MOC with real-time rich data so that an MOC can provide navigational advice to a Vessel. In other words the vessel has a particular need to contact the MOC, which is somewhat different from e.g. situations where a vessel would broadcast navigational information and/or intent for any party that is interested (as e.g. current AIS broadcasts over VHF).

Note that it is also possible for an autonomous or low-manned vessel to be tracked and controlled by an operating station, using a propietory protocol possible over a dedicated private network or connection; such that the operating station could now act as a Vessel towards a MOC (e.g. a manadatory VTS) using the protocol specified in this memo.

The Vessel Remote Guidance Protocol will itself of course rely on other protocols and standards, including but not limited to HTTP, Web Socket and WebRTC, and of course to some degree the protocols that these depend on.

This specification deliberately avoids specification of lower level networking requirements, it is assume that a sufficiently high quality internet connection is available. What excactly is deemed sufficient depends on the actual use. Maritime authorities, classification bodies or insurers may set minimum requirements for different situations. Even within a single use case, such as for example remote pilotage, the minimum requirements for bandwidth and reliability may very based on the distance from other ships and hazards, the weather, etc.  
However, it is important to address unexpected disconnections, re-establsihment of connections, and relative priorities of various data sources and streams.

All in all, some _examples_ of what this specifiation needs to address include: 

- ensure that the Vessel communicates with a trustworthy MOC.
- establish a standard naming of data sources, to indicate e.g. the onboard position of a video camera.
- the various sources will require different types of WebRTC connections, these types and their parameters need to be specified; including e.g. video codecs that should be used.
- the structure and content of the signalling and navigational messages.
- how the Vessel and the MOC should handle exceptions such as unexpected disconnections.

Note that this specification does _not_ prescribe _how to use_ the real-time data and navigational advice messages. For example, in remote pilotage (futher) regulations may state that the vessel must be able to provide a certain class of radar data, that it is mandatory for the vessel to verify the identity and qualifiactions of the remote pilot (the operator in terms of this specification), that a route should be exchanged before any other guidance should be given or accepted, and that pilot information, routes, and all guidance be logged in the vessel data recorder.

### 1.4. Definitions
- The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and
      "OPTIONAL" in this document are to be interpreted as described in [RFC2119].
- *Vessel* the party that provides one or more streams of real-time data to a MOC.
- *MOC*, the Maritime Operation Center, requests *data from* vessels and provides *guidance to* vessels.
- *MMSI*, a Marine Mobile Service Identifier as specified in [M.585-8].


## 2. Protocol
Many of the messages specified in this memo merely convey information but some messages presume specific actions from the recipient. This section describes those actions, whereas the details of the structure and content of messages are given in the next section, [Messages](#3-messages). But before any message can be sent a communications channel must be established, this is called _Registration_.

### 2.1. Registration
Vessels register with a MOC in two steps: first the vessel opens a [WebSocket] to the MOC, and then it sends a message with its status and capabilities.

Discovery of the URL of the endpoint for registration with the MOC is out of the scope of this specification. For example, a vessel might discover the registration url for a remote pilotage service by means of a query to a *MCP Service Registry*. Whereas the registration url of a remote control center for a semi-autonomous vessel is likely to be known to the vessel software in advance.   
In any case the last part of the path of the URL SHOULD be used to convey the MMSI of the vessel. For example the URL could be:

    wss://amoc.aboamare.net/navigation/[mmsi]
    
so a vessel with MMSI "230172000" would contact: 

    wss://amoc.aboamare.net/navigation/230172000

The MOC endpoint MUST BE secure, i.e. the endpoint MUST support the secure web socket protocol [WebSocket], and the protocol part of the url MUST be "wss" [RFC8307]. The MOC SHOULD offer the registration endpoint on port 443.

The WebSocket implementation used by the vessel MUST verify the TLS certificate presented by the MOC, and refuse to connect if the certificate is not valid. It is RECOMMENDED that vessel software is configured to accept only certificates issued by Certificate Authorities that are explicitly configued as such, and for which the root (or intermediate) certificates have been obtained in a secure manner (out-of-band).

As soon as the web socket is open the vessel MUST send a _message_ ([see below](#3-Messages)) with either a request for the MOC to [_authenticate_](#212-authentication-of-the-MOC) itself to the vessel *or* with the following information:
- *vessel* information
- current *conning* (navigation status) data
- current *cautions*, *warning*, *alarms*, and *emergencies*, as specified in [section 5](#5-cautions-warnings-alarms-and-emergencies), if any
- requested *guidance*
- the description of the real-time *streams* that can be requested 
- the possible *controls* for remote operation of the vessel, if any

While the web socket connection is open the vessel MUST send a *[conning](#35-conning)* message at least every 5 seconds, but not more frequently than every 2 seconds. In addition each the vessel MUST send a *[notification](#36-notifications)* for each defined caution, warning, alarm or emergency that arises, gets acknowledged or gets cancelled.

#### 2.1.1. Authentication of the Vessel

The *Maritime Connectivity Platform* [MCP] makes it possible, and likely, that a vessel (software) has been issued a PKI certificate that binds the vessel __mrn__[MRN] to a private-public key pair. The MOC could therefor require that the vessel uses its MCP certificate as client certificate during the TLS negotiation of the Registration step. The MOC would then have to check that the client certificate has not been revoked, but otherwise can be somewhat assured of the identity of the vessel. 

The MCP also defines the use of [OIDC] tokens that could be used to authenticate persons with a registered mrn. Such tokens could be used in case e.g. an Officer Of the Watch (OOW) authenticates to the MOC (on behalf of the vessel).

A MOC SHOULD authenticate the vessel, and a it is RECOMMENDED that a MOC supports MCP certificates as TLS client certificates. 

A MOC that does support MCP certificates SHOULD request a ClientCertificate during the TLS handshake[TLS12] or [TLS13]. Such a MOC SHOULD verify the revocation status of a presented client (vessel) certificate with the Maritime Identity Register that issued the certificate. The MOC also SHOULD verify the status of the certificate of the MIR that issued the certificate.

If the vessel (software) did not present a client certificate the MOC MAY request the vessel to authenticate with an MCP OIDC token, by sending an *[authenticate](#391-authenticate)* message to the vessel.

#### 2.1.2. Authentication of the MOC

A Maritime Identity Registry (MIR) of the MCP can assign an __mrn__[MRN] to the MOC and issue a PKI certificate for it. A MOC SHOULD register with a MIR in good status and obtain a MCP certificate. However, MCP certificates will not be chained to a root certificate that is recognized by default by most TLS stacks, so the MOC should not use the MCP certificate as a server certificate for TLS. 

A vessel that wishes for the MOC to proof its identity MAY send an *[authenticate](#391-authenticate)* message, this message will contain a nonce. A MOC that receives an _authenticate_ message MUST as soon as possible send an *[authentication](#392-authentication)* message.

Here is an example exchange where a vessel requires the MOC to authenticate, to proof it has an MIR-issued cert and the private key bound to it.

  1. The vessel sends an _authenticate_ message, indicating it will only except PKI based authentication with a MIR-issued cert. It includes a nonce that the MOC is expected to sign.
  ```
  {
    "authenticate": {
      "type": ["mrn-cert"],
      "nonce": "OaONCjyuphFXfBe72sC22Rz/HGnwCD/sA7vyA63GpXM="
    }
  }
  ```

  2. The MOC now creates a *JSON Web Token [JWT]* that contains the nonce, the MRN of the MOC, the date, etc. as the _payload_ of the JWT. 
  The JWT also has a URL that points to the MIR-issued certificate and the certificate chain, in the _protected headers_ of the JWT. Finally the JWT is signed with the private key associated with the certificate of the MOC. The _payload_, the _protected headers_ and the _signature_ are then encoded an concatenated in a single string, the actual"token" (all as specified by [JWT]). The JWT, as token, is then sent in an _authentication_ message:
  ```
  {
    "authentication": "eyJhbGciOiJFUzM4NCIsIng1dSI6Imh0dHBzOi8vbWlyLmFib2FtYXJlLm5ldC90ZXN0L2NlcnRpZmljYXRlcy8xZGEzYTExYjFhYjc2ZWE5MjZiNTFmZjk1Yzc5M2I3MWVhMTc1ZTMzLng1dSJ9.eyJub25jZSI6ImJvaFF3bmc3MksiLCJzdWIiOiJ1cm46bXJuOm1jcDppZDphYm9hbWFyZTp0ZXN0OmFib2FtYXJlLXNwaXJpdCIsImlhdCI6MTY0MDg4NTIzNSwiZXhwIjoxNjQwODkyNDM1fQ.L28PGA2L9SLrFQN9OvG9p1MLjWZX8xe9C-60i23rhW0Hvq4u00hkuTTss6EKJg0iGJiwhnZ-sZpObBLWS6vVwwft_90oWg2z-xEVzaHsu3qRqkol2bFXVclCcDcij4Gg"
  }
  ```
  The vessel can now unpack the authentication message value, i.e. the JWT and verify the signature and certificate of the MOC.  

### 2.2. Request for Data
The MOC can request the Vessel to open a stream of defined types of data. To this end the MOC SHOULD send a *[request](#34-request)* message. The request MUST be for one of the data streams that the Vessel has reported in the most recent *[streams](#32-streams)* message. Upon reception of a *request* message the Vessel MUST attempt to open the requested stream. If no WebRTC connection has yet been established the Vessel MUST attempt to establish the WebRTC connection and as soon as that connection is in the "open" state add the requested stream to it. If, beacuse of already established streams, a WebRTC connection already has been established earlier the Vessel MUST attempt to add the requested stream to that connection.

In case the stream cannot be added the Vessel SHOULD send a *failed* message. 

If the Vessel becomes aware of a problem such that it won't be able to honour requests for one or more streams that it earlier reported in a *streams* message, it should send a new *streams* message that only lists those streams that are currently available.

### 2.3. WebRTC Signalling
To setup and maintain WebRTC connections the vessel and MOC need to send _signalling_ messages to convey _ICE candidates_ and _Session Descriptions_. In addition a MOC may want to inform a vessel about STUN and/or TURN servers that the vessel may use.

To inform a WebRTC peer about an _ICECandidate_ the local WebRTC implementation SHOULD send an *[ice](#3111-ice)* message over the websocket.
To inform a WebRTC peer about a _SessionDescription_ the local WebRTC implementation SHOULD send an *[sdp](#3112-sdp)* message over the websocket.

A MOC that wishes to inform a vessel about STUN and/or TURN servers SHOULD add a *ice_servers* property to a *[request](#34-request)* (for real time data) message.

### 2.4. Hang-up

To indicate the orderly close-down of the connection either party SHOULD send a *[bye](#310-bye)* message. The recipient of a *[bye](#310-bye)* message SHOULD close any WebRTC connections established with the sender, and close the WebSocket. The WebSocket MUST be closed with a 1000 CloseEvent status code, to indicate normal closure.

**IMPLEMENTATION CONSIDERATION**: of course the connection between a vessel and MOC can be interrupted, broken altogether, etc. Implementations should make sure to act upon such situation and to free resources. The _bye_ message serves to keep a record of an _intentional_ closure of the connection.

### 2.5. Control of the Vessel
A vessel may wish that a MOC takes control of the vessel, such that the MOC assumes the responsibility of navigating the vessel and to this end sends commands that are intended for the steering, propulsion, and other equipment of the vessel. It is important that it is always very clear which entity has control over the navigation, and that there is only one such entity at any given time.

A vessel that wishes for a MOC to control navigation MUST send a *[guidance](#37-guidance)* message with a value of `"control"`. In addition the vessel MUST send a *[controls](#33-controls)* message to indicate which systems it offers for the MOC to control.

A MOC that is ready to take control of one or more of the controllable systems of the vessel MUST first acquire control of those systems, by means of the *[acquire](#374-acquire)* message.  
A MOC MUST NOT attempt to aquire conrol of any controllable system if the most recently received *guidance* did not ask for `"control"`.  
A MOC SHOULD NNOT attempt to aquire control of systems that were not listed in the most recent *controls* message sent by the vessel. And A MOC SHOULD NOT send *[command](#375-command) messages for any component of a controllable system that is not listed in the most recent *controls* message.

A vessel that receives an *acquire* message SHOULD refrain from changing any of the (listed) setpoints of any of the components of those controllable systems that are requested in the *acquire* message with the exception that a component of a controllable system MAY continue to control another component of the same controllable system. Informally, if the autopilot is "on" it is ok that the autopilot continues to control the steering, until the MOC would turn the autopilot "off". But the vessel should no longer change autopilot parameters, such as e.g. radius, that were listed for remote control.  
A vessel that has **not** received an *acquire* message for one of its controllable systems SHOULD ignore any *[command](#375-command)* messages for any of the components of that controllable system.  
If a vessel upon reception of an *acquire* messages cannot, or does not wish to, yield control of any of the indicated controllable systems it MUST immediately respond with a new, possibly empty, *controls* message that lists the controllable systems that _can_ be acquired by the MOC. If the vessel no longer can, or wishes, to give any control to the MOC it SHOULD send a new *guidance* message with a value **other** than `"control"`. Likewise if for any reason the vessel no longer wants the MOC to control one or more of the controllable systems it SHOULD send a (new) *controls* message and if needed a new *guidance* message.

Once a MOC has sent an acquire message it should assume responsibility of the acquired controllable systems, and can now send *[command](#375-command)* messages to change the setpoints of one or more of the components of the controlled systems.

A MOC that no longer can, or no longer wishes to, control one or more of the controllable systems that it has acquired MUST send a *[takeover](#376-takeover)* message listing those systems. The MOC SHOULD continue to control those systems until the vessel sends a *[release](#377-release)* message, or until the timeout of the *takeover* message expires, whichever occurs first.

## 3. Messages
*Most* messages are such that they do *not* follow a request/response pattern, each message essentially provides the other party with information. However, the previous section, "[Protocol](#2-protocol)", refers to those messages that presume some action by the recipient. Examples of such messages include "[authenticate](#391-authenticate)", "[request](#34-request)", and "[bye](#310-bye)".

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
  
  Here an example with three messages, "streams", "guidance", and "nmea":
  ```
  {
    "streams": {
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

### 3.1. vessel
The _vessel_ message is used to convey information about the vessel that requests guidance. This includes a.o dimensions, cargo, etc. Most, if not all, of this information is "static", in that it can be assumed to remain valid for the duration of the interaction with the MOC, or indeed for the duration of the voyage. A _vessel_ message therefor MUST be __either__ a string with a URL pointing to a publicly available JSON document with a vessel object, __or__ such an object. The vessel object (in the message or JSON document) has the following properties:  

__mmsi__ the object MUST have an _mmsi_ property with the Maritime Mobile Service Identifier[MMSI] string of the vessel.

__call__ the object SHOULD have a _call_ property which value SHOULD be the international radio call sign assigned to the vessel.

__name__ the object SHOULD have a _name_ property with the name of the vessel as visible on the vessel.

__loa__ the object MUST have a _loa_ property with the overall length of the vessel, in meters, rounded to one decimal.

__breadth__ the object MUST have a _breadth_ property with the maximum overall width of the vessel, in meters, rounded to one decimal.

__height__ the object MUST have a _height_ property with the overall height of the vessel, in meters, rounded to one decimal. The height is measured from the keel to the top of the vessel, including masts, antennas and other appendages.

__draft__ the object MUST have a _draft_ property with either a single number representing the average draft or an object with both a _forward_ as well as an _aft_ property with the current drafts at those positions. The draft reported here in the _vessel_ message SHOULD represent the draft for the current voyage and cargo. If the voyage covers various types of water, the reported draft should be the summer temperate sea water draft. Drafts shall be given in meters, rounded to one decimal.

__from_above__ the object SHOULD have a _from_above_ property with as content a string with the drawing commands of an SVG ```<path>``` element[SVG], such that the outline of the defined path corresponds with the outline of the vessel as seen from above. The coordinates of the points shall be in meters. The port side of the vessel SHOULD be aligned with the 0 value of the SVG x-ax, and the bow of the vessel SHOULD be aligned to the 0 value on the SVG y-ax. 

_Informally_, the ship should be pointing up/North. For example, a ship with a length of 50m and a width of 10m could report:
```
{
  "vessel": {
    ...,
    "loa": 50.0,
    "breadth" 10.0,
    "from_above": "M 5 0 L 10 7 L 10 48 L 5 50 L 0 48 L 0 7 Z",
    ...,
  }
}
```
Here, the bow is at 5,0 (X at half the width, and Y at 0), and the stern at 5,50. This could look like: 

![Vessel from above](./images/from_above_path.svg)

A more accurate outline can be provided by using the commands to draw Bézier curves. For the same vessel the ```"from_above"``` could be given as ```"M 5 0 Q 10 3 10 7 L 10 48 Q 10 50 5 50 Q 0 50 0 48 L 0 7 Q 0 3 5 0"```, which renders as e.g.:

![Vessel from above with curves](./images/from_above_path_with_curves.svg)

__from_abaft__ the object SHOULD have a _from_abaft_ property with as content a string with the drawing commands of an SVG ```<path>``` element[SVG], such that the outline of the defined path corresponds with the outline of the vessel as seen from abaft (behind). The coordinates of the points shall be in meters. The port side of the vessel SHOULD be aligned with the 0 value of the SVG x-ax, and the highest point of the vessel SHOULD be aligned to the 0 value on the SVG y-ax.

For example, a ship with a length of height of 20m and a width of 10m could report:
```
{
  "vessel": {
    ...,
    "height": 20.0,
    "breadth": 10.0,
    "from_abaft": "M 5 20 Q 0 20 0 19 L 0 11 L 2 11 L 2 5 L 0 5 L 0 3 L 4.5 3 L 4.5 0 L 5.5 0 L 4.5 3 L 10 3 L 10 5 L 8 5 L 8 11 L 10 11 L 10 19 Q 10 20 5 20",
    ...,
  }
}
```
In this example the SVG drawing commands start at the keel at 5,20 (5 meters from port and 20 meters from the top most point) and then proceed clockwise. This could be rendered as:

![Vessel from abaft](./images/from_abaft_path.svg)

__simulation__ the object MAY have a _simulation_ property that when present SHOULD have a value of "true". This property MUST be included, and the value MUST be "true" whenever the vessel is a (computer) simulation, is not observed in the real world, may operate in a different time frame, etc.

### 3.2. streams

### 3.3. controls

### 3.4. request

The _request_ message is sent by a MOC that wishes that the recipient vessel starts sending a data stream. The content of a request message is either a string with the name of the stream, or an object with one or more properties such that each property is a name of a stream with as value either _true_ or an object with further requirements on the requested stream. The supported further requirements are given in subsections of [Section 4](#4real-time-connections). 

In addition the request object (in the complex form) MAY have an _iceServers_ property which when present MUST be an array of WebRTC _RTCIceServer_ objects, each describing one server which may be used by the ICE agent; these are typically STUN and/or TURN servers. If no WebRTC connection has been established yet the _iceServers_ property SHOULD be included and MUST contain the information about at least one STUN server.

The _request_ MUST only refer to streams that the vessel listed in its most recent _streams_ message.

For example, a simple request for standard conning data would be:
```
{"request": "conning"}
```
whereas a complex request for both conning and video from camera 0 could look like:
```
{"request": 
  {
    "conning": {
      "priority": true,
      "format": "nmea"
    },
    "camera0": true,
    "iceServers": [
      {
        urls: ["stun:stun.aboamare.net:5349"],
        credential: "",
        username: ""
      }
    ]
  }
}
```

A vessel that receives a request MUST attempt to open a WebRTC connection if needed and add the requested data streams to the connection, as specified in [Section 4](#4real-time-connections).

### 3.5. conning
The conning message contains information about the current navigational state of the vessel. The message can contain data from many sensors, not all of which will always be available. However, a vessel that has registered itself with a MOC SHOULD send a *conning* message at regular intervals as specified above in *[Registration](#21-registration)*; that *conning* message: 

  - MUST include the properties: *lat*, *long*, *heading*, *cog*, and *sog*,
  - and SHOULD include *position*, *rot*, *steering*, *propulsion*, *stw*, *aws*, *awa* and *depth*, 
  - and MAY include any of the properties listed in table below.

#### predictor

### 3.6. Notifications
The notification messages are sent by a vessel to notify the MOC of events and situations that the MOC should be aware of. Six levels of severity are defined each with their own message. Whereas _[debug](#361-debug)_ and _[info](#362-info)_ can be used rather freely, the use and content of _[caution](#363-caution)_, _[warning](#364-warning)_, _[alarm](#365-alarm)s_ and _[emergency](#366-emergency)_ messages is futher specified in the corresponding subsections below, and in [5. Cautions, warnings, alarms and emergencies](5-cautions-warnings-alarms-and-emergencies).

The properties of notifications are specified in the following list, subsequent sections define which properties are used in the actual messages:

- __msg__: a string, with a textual representation of the information in the notitification. MUST be present in _debug_ and _info_ messages, and is RECOMMENDED for _caution_, _warning_, _alarm_, and _emergency_ messages.

- __id__: a UUID string that uniquely identifies the situation described in a notification. SHOULD be present in _caution_, _warning_, _alarm_, and _emergency_ messages.

- __category__: a string, used to indicate the kind of shipboard system, or the kind of operation, that is affected by the reported situation. For example "propulsion", "steering", etc. The actual category to use is defined in [section 5](#5-cautions-warnings-alarms-and-emergencies).

- __source__: a string, that identifies the source or place of the reported situation, e.g. "steering pump port 1". Some of the messages below prescribe standardized phrases.

- __raised__: the UTC date and time, in the ISO 8061 date-time format specified in [RFC3339], when the situation described in this notification was observed.

- __acknowledged__: the UTC date and time, in the ISO 8061 date-time format specified in [RFC3339], when the situation described in this notification was acknowledged.

- __cancelled__: the UTC date and time, in the ISO 8061 date-time format specified in [RFC3339], when the situation described in this notification was no longer observed, and hence no longer requires attention.

For particular categories and sources it can be useful to add additional information in further attributes. Rules and suggestions are given in the specific message sections.

#### 3.6.1 debug
The _debug_ message is used to convey information that aids the development of the implementation. This message SHOULD NOT be sent by implementations in actual operational use. 
The _debug_ message MUST have a _msg_ property with as value a string with the information.

#### 3.6.2 info
The _info_ message is used to convey information that might be useful to the MOC but is not deemed important or critical.
The _info_ message MUST have a _msg_ property with as value a string with the information.

#### 3.6.3 caution
The _caution_ message is used to convey information about a situation or possible issue that the MOC should take note of, is likely to require attention but does not (yet) warrant a warning or alarm. A _caution_ message MUST have a _category_, MUST have __one of__ _raised_, _acknowledged_ or _cancelled_, and SHOULD have an _id_. [section 5](#5-cautions-warnings-alarms-and-emergencies) specifies when this message should be sent, and with what content.
 
#### 3.6.4 warning
The _warning_ message is used to convey information about a situation that __requires attention__. A _warning_ message MUST have a _category_, MUST have __one of__ _raised_, _acknowledged_ or _cancelled_, and SHOULD have an _id_. [section 5](#5-cautions-warnings-alarms-and-emergencies) specifies when this message should be sent, and with what content.

#### 3.6.5 alarm
The _alarm_ message is used to convey information about a situation that __requires *immediate* attention__. An _alarm_ message MUST have a _category_, MUST have __one of__ _raised_, _acknowledged_ or _cancelled_, and SHOULD have an _id_. [section 5](#5-cautions-warnings-alarms-and-emergencies) specifies when this message should be sent, and with what content.

#### 3.6.6 emergency
The _emergency_ message is used to convey information about a situation where __life or vessel are in immediate danger__. An _emergency_ message MUST have a _category_, MUST have __one of__ _raised_, _acknowledged_ or _cancelled_, and SHOULD have an _id_. [section 5](#5-cautions-warnings-alarms-and-emergencies) specifies when this message should be sent, and with what content.

### 3.7. guidance
The _guidance_ message is sent by a vessel to indicate the kind of guidance it wishes to receive from the MOC. The vessel MUST include the requested _guidance_ in its initial message to to MOC. The following kinds of guidance SHOULD be recognized by a MOC:

  - **advice**: information that is provided to the vessel with the implicit recommendation to take that information into account in navigation and other actions. Informally, this is equivalent to "Be adviced that....", and this is the type of guidance that is often given by VTS, weather services, etc.

  - **recommendation**: this signifies a request for _recommended_ actions for the vessel to take. The vessel is likely to follow given recommendations, but might also ignore such recommendations. Informally, this type of guidance can be used for pilotage and for rescue operation instructions given by a Maritime Rescure Coordination Centre.

  - **control**: this signifies a request for the MOC to take control of the (navigation of the) vessel, i.e. to send _command_ messages.

#### 3.7.1. operator
The _operator_ message is used to iform the vessel of the operator that is providing the guidance. The content of this message is a simple string that SHOULD be the MRN of the operator. A MOC SHOULD send an operator message before, or in conjunction with, the first guidance message it sends. If the operator changes while the vessel is still connected to the MOC, such a MOC SHOULD send an operator message. The goal is that the vessel can record which operator is providing the guidance.

#### 3.7.2. advice
#### 3.7.3. recommendation
#### 3.7.4. acquire
The _acquire_ message is send by a MOC that deems it appropriate to control one or more of the controllable systems of the vessel.

A MOC should only attempt to acquire control when the vessel has requested _control_ in its _guidance_ message, as defined in [Section 2.5](#25-control-of-the-vessel).  
The content of the _acquire_ message MUST be either a string with one of the controllable aspects of the vessel as reported in the _controls_ message, or an array with one or more of those systems.

#### 3.7.5  command
The _command_ message is used by a MOC to change the requested value of one or more of the components of a controllable system of the vessel. 

#### 3.7.7. takeover
The _takeover_ message is sent by a MOC that no longer wishes to control one or more of the controllable system of the vessel. It lists those systems and SHOULD include a timeout.

The properties of a _takeover_ message are:
  - __controls__: a string, or array of strings, indicating the controllable system(s) that the MOC no longer wishes to control
  - __timeout__: an integer with the number of seconds that the MOC will wait for a corresponding *release* message, until then the MOC will continue to control the listed systems. If absent the vessel and MOC MUST assume a 30 seconds timeout. 

#### 3.7.7. release

#### 3.7.8. route

### 3.8. time
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

### 3.9. authentication messages
#### 3.9.1. authenticate
The _authenticate_ message MAY be sent by the party that wishes to authenticate the other party. Typically it is the vessel that wants to authenticate the MOC. The message is an object that MUST have a _type_ property the value of which is an array of strings with authentication methods that can be used by the recipient of the message. Supported methods specified here are "mrn-cert" and "mrn-token", which stand for authentication based on a certificate as issued by a [MIR] resp. authentication with a OIDC token issued by a [MIR]. 

If the list of supported authentication types includes "mrn-cert" the message MUST have a _nonce_ property with as value the base64 encoding of a random 256 bit value.

Example:
  ```
  {
    "authenticate": {
      "type": ["mrn-cert"],
      "nonce": "OaONCjyuphFXfBe72sC22Rz/HGnwCD/sA7vyA63GpXM="
    }
  }
  ```

The recipient of this message MUST send an _authentication_ message that refers to the nonce.

#### 3.9.2. authentication
A recipient of an _authenticate_ message MUST send an _authentication_ message, as soon as possible. The actual value of the _authentication_ message is dependent on the _type_ of authentication. This type must be one of those listed in the authenticate message.

__mrn-cert__   
For authentication based upon the MRN certificate the authenticating party MUST create a *JSON Web Token[JWT]*. The _payload_ of the token MUST include the following _claims_: 
  - _nonce_: with the nonce of the authenticate request message
  - _sub_: with the MRN of the authenticating party
  - _iat_: with the time the token was created
  - _exp_: with the date the token should no longer be deemed valid. This expiration time SHOULD not be more than 24 hours later than the token creation time.  

The token MUST have the following _protected headers_:  
  - _alg_: the label of the signature alorithm. The algorithm MUST be one of the algorithms allowed in the [MCP] [MIR] specifications (currently ES384 and ES256).
  - _x5u_: with a URL pointing to the certificate chain that starts with the certificate of the authenticating party. All certificates in the chain MUST be in accordance with the [MCP] [MIR] specifications.

The authenticating party MUST sign the token with the key that is bound the the first certificate of the chain that is pointed to in the _x5u_ header. The encoded token is sent as the value of an _authentication_ message.
  E.g.:
  ```
    {
      "authentication": "eyJhbGc...ng1dSJ9.eyJub25jZSI6I...kyNDM1fQ.L28PGA2L...Dcij4Gg" 
    }
  ```

  The recipient of the _authentication_ message can now unpack the message value, i.e. the JWT, verify the signature and certificate of the MOC, and now has some assurance of the identity of the sender.

__mrn-token__  
If authentication is done with tokens the authenticating party MUST obtain an [MCP] ([OIDC]) _Authorization Code_ from its MCP Identity Registry [MIR]. The authenticated party now MUST send an _authentication_ message with as value an object with two properties: a _url_ with as value the HTTPS URL to the _Token endpoint_ of the MIR, and a _code_ with as value the [OIDC] _Authorization Code_ that should be presented at the given endpoint. The _url_ and _code_ should be such that the MIR will respond to a request for that URL with an [OIDC] Identity Token with the claims about the authenticated party, packaged as a [JWT] token.

E.g.:
```
  {
    "authentication": {
      "url": "https://mri.aboamare.net/id_token",
      "code": "SplxlOBeZQQYbYS6WxSbIA"
    }
  }
```

The recipient of such _authentication_ message can now act as OIDC client and request the Identity Token from the MIR of the authenticated party. The MIR should authenticate the client, this can be done using a MCP certificate as part of the TLS handshake. 

NOTE: ID tokens might not yet be working this way in the MCP MIR, but could be supported.

##### 3.9.2.1. Authentication Errors
In case the authenticating party cannot, or does not wish to, honour the requested authentication it MUST send an _authentication_ message with an _error_ object. The _error_ object MUST have a _code_ property which SHOULD be one of the codes listed below. In addition the _error_ object MAY have a _msg_ property with a short string that may provide further information.  

### 3.10. bye

### 3.11. WebRTC Messages
#### 3.11.1 ice
#### 3.11.2 sdp

## 4. Real-time connections

### 4.1. conning
A stream of mainly fairly standard, well-established, messages in e.g. NMEA or Signal K (delta) format, following the Signal K data model.
In addition perhaps a few additional or "new" messages for e.g.:

#### 4.1.1 predictor?

### 4.3.radar

### 4.4. camera

### 4.5. audio?

## 5. Cautions, warnings, alarms, and emergencies
Generally speaking it is crucially important that a MOC is aware of abnormal situations aboard the vessel. The vessel therefore must send information about such situations in _caution_, _warning_, _alarm_ and _emergency_ messages. However, not all abnormal sitations are of interest to a MOC. For example a clogged toilet in a cabin may raise an alert on the vessel, but may be of no interest to a MOC. For purposes of reliable interoperability, guidance and navigation this section mandates a list of situations that a compliant vessel should notify about.

The table below groups and names those situations and is based upon [IMO-A2021], where the "function" in the [IMO-A2021] specification is used as value for the _category_ property.

  - the _category_, if given, MUST be present in the notification message, verbatim.
  - the columns for _caution_, _warning_, _alarm_, and _emergency_ indicate if a corresponding message MUST be sent (M), SHOULD be sent (S), or is RECOMMENDED to be sent (R), or SHOULD NOT be sent (empty). 
  - the _additional properties_ column prescribes properties that are RECOMMENDED to be included, with the < required value > prescribed between angled brackets.
  - the _sources_ column indicates the type, and RECOMMENDED naming convention of, systems, locations, etc., that further identify the sitation. If the source is printed in __boldface__ the message MUST have a _source_ attribute. Otherwise it is RECOMMENDED that the message includes the _source_, if known.
  - the _ref_ column indicates the paragraph number in [IMO-A2021] that describes the situation, if defined. Navigational alarms may refer to "INS", that is to Appendix 5 of [IMO-MSC252].


| category                      | caution | warning | alarm | emergency | additional properties               | sources                   | ref    |
| ----------                    | :---:   | :-----: | :---: | :----:    | -----                               | ------                    | ------ |
| General emergency alarm       |         |         |       |  M        |                                     |                           | 3.2.1  |
| Fire alarm                    |         |         |   M   |  M        |                                     |                           | 3.3.9, 3.2.2  |
| Water ingress                 |         |         |   M   |  M        |                                     |                           | 3.3.5, 3.2.3  |
| Machinery alarm               |         |         |   M   |           |                                     |                           | 3.3.1  |
| Steering gear alarm           |         |         |   M   |           |                                     |                           | 3.3.2  |
| Control system fault          |         |         |   M   |           |                                     |                           | 3.3.3  |
| Bilge alarm                   |         |         |   M   |           |                                     |                           | 3.3.4  |
| Watch alert                   |    M    |     M   |   M   |           |                                     |                           | 3.3.8  |
| Fire extinguishing activated  |         |         |   M   |           |                                     |                           | 3.3.10 |
| Cargo alarm                   |         |         |   M   |           |                                     |                           | 3.3.12 |
| Gas detected                  |         |         |   M   |           |                                     |                           | 3.3.13 |
| Watertight door malfunction   |         |         |   M   |           |                                     |                           | 3.3.14 |
| Power supply failure          |         |         |   S   |           |                                     |  heading_control, autopilot, ECDIS, gyro_1, radar_1 echo_sounder  | INS |
| Off heading                   |         |     M   |       |           | heading < deg true >, set_heading < deg true> | heading_control, autopilot | INS  |
| Course difference             |         |     S   |       |           | heading < deg true >, track_course < deg true> | ECDIS, heading_control, autopilot | INS  |

### 5.1. Examples

A bridge officer has not yet acknowledged the first (only visual) reminder of the bridge navigational watch alarm system, the vessel sends:
```
{"warning": 
  {
    "category": "Watch alert",
    "id": "e953395c-86fa-11eb-8dcd-0242ac130003"
    "raised": "2021-03-17T10:23:45Z"
  }
}
```
When 3 seconds later a bridge officer signals his presence to the system, the situation is no longer present, so the vessel sends a new message, note that the id is the same as when the alarm was raised.
```
{"warning": 
  {
    "category": "Watch alert",
    "id": "e953395c-86fa-11eb-8dcd-0242ac130003"
    "cancelled": "2021-03-17T10:23:48Z"
  }
}
```

A problem with the steering gear is detected, so the vessel sends:
```
{"alarm": 
  {
    "category": "Stearing gear alarm",
    "id": "a934b354-86fb-11eb-8dcd-0242ac130003"
    "raised": "2021-03-17T10:33:28Z"
  }
}
```
A ship officer acknowledges the alarm, so the vessel sends:
```
{"alarm": 
  {
    "category": "Stearing gear alarm",
    "id": "a934b354-86fb-11eb-8dcd-0242ac130003"
    "acknowledged": "2021-03-17T10:33:240Z"
  }
}
```
Some 30 minutes later the engineers have fixed the issue, so the vessel sends:
```
{"alarm": 
  {
    "category": "Stearing gear alarm",
    "id": "a934b354-86fb-11eb-8dcd-0242ac130003"
    "cancelled": "2021-03-17T11:03:17Z"
  }
}
```


## 6. Security Considerations


## 7. Implementation Considerations


## 6. References

## 6.1. Normative References

[IMO-A1021]
  [IMO Resolution A.1021(26). Code on cautions and indicators](https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/AssemblyDocuments/A.1021(26).pdf). International Maritime Organization, December 2009.

[IMO-MSC252]
  [(Adoptiopn of the revised) Performance standards for integrated navigation systems (INS)](https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.252(83).pdf). International Maritime Organization, October 2007.

[AV1]
  [AV1 Bitstream & Decoding Process Specification](https://aomediacodec.github.io/av1-spec/av1-spec.pdf)

[CMS]
  [Cryptographic Message Syntax](https://tools.ietf.org/html/rfc5652).

[M.585-8]
  [Recommendation ITU-R M.585-8, Assignment and use of identities in the
maritime mobile service (10/2019)](https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.585-8-201910-I!!PDF-E.pdf).

[MRN]
  The IANA assignment of the ["mrn" URI and namespace](https://www.iana.org/assignments/urn-formal/mrn).

[OIDC]
  [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html)

[PEM]
  [Textual Encodings of PKIX, PKCS, and CMS Structures](https://tools.ietf.org/html/rfc7468).

[RFC2119]
  [Key words for use in RFCs to Indicate Requirement Levels](https://www.rfc-editor.org/rfc/rfc2119.txt), S. Bradner. The Internet Society, March 1997.

[RFC3339]
  [Date and Time on the Internet: Timestamps](https://tools.ietf.org/html/rfc3339), G. Klyne. The Internet Society, July 2002.

[RFC8307]
  [Well-Known URIs for the WebSocket Protocol](https://tools.ietf.org/html/rfc8307), C. Bormann, Universitaet Bremen TZI, January 2018.

[RFC8933]
  [Update to the Cryptographic Message Syntax (CMS) for Algorithm Identifier Protection](https://tools.ietf.org/html/rfc8933)

[RTZ]
  [IEC PAS 61174-1:2021 Maritime navigation and radiocommunication equipment and systems – Part 1: Route plan exchange format (RTZ)](https://webstore.iec.ch/publication/67774)

[SVG]
  [Scalable Vector Graphics (SVG) 1.1 (Second Edition)](https://www.w3.org/TR/2011/REC-SVG11-20110816/).

[WebRTC]
  [WebRTC 1.0: Real-Time Communication Between Browsers](https://www.w3.org/TR/webrtc/)

[WebRTC Priority]
  [WebRTC Priority Control API](https://www.w3.org/TR/webrtc-priority/)

[WebSocket]
  [The WebSocket Protocol](https://tools.ietf.org/html/rfc6455)

## 6.2. Informative References

[JWT]
  [JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519).

[MCP]
  [Maritime Connectivity Platform](https://maritimeconnectivity.net/)

[MIR]
  Maritime Identity Registry of the [Maritime Connectivity Platform](https://maritimeconnectivity.net/).

## Acknowledgements
The following persons provided valuable comments during the development of this specification:
* Matti Aaltonen, Traficom.

## Contributors

## Author's Address

    Robert J. Aarts
    AboaMare Ltd & Novia University of Applied Sciences
    robert.aarts@novia.fi