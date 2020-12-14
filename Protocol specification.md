# Vessel Remote Guidance Protocol Specification *Draft* 0.1.0

## Contributors

* Robert J. Aarts, AboaMare Ltd & Novia University of Applied Sciences, robert.aarts@novia.fi

Want to contribute? Read [CONTRIBUTING](./CONTRIBUTING.md)!

## Introduction

There are various scenarios where a distant party, typically but not necessarily ashore, has an interest to obtain accurate, and detailed, information about a ship reliably and in real-time with the purpose of advising the ship in navigation. Examples include, but are not limited to, remote piloting of crewed ships, remote control of autonomous ships, disaster avoidance, etc. Commonly used procedures and technology are limited in detail (VHF verbal comms, AIS), reliability, and timeliness(AIS). However, the digitalization of bridge equipment had resulted in the availability of a wide variety of rich information, but _at the ship_. 
Propietary solutions to export some of that information to shore-based stations exist, but due to their propietary nature these are not suitable for maritime operators other then the owner (shipping company) or certain suppliers of the shipping company (as in e.g. engine diagnostics). Likewise there have of course been propietary, or ad-hoc, means to send control commands from ashore to a vessel as in e.g. remotely controlled scale models.

This specification then defines protocols, and protocol parameters, to securely expose accurate, detailed, bridge information in real-time to trusted distant parties. Any shipyard, bridge equipment provider, shipping company or maritime operator can implement support for the protocols specified here. Similarly this specification defines protocols and messages to securely send advice (messages about the navigation) to vessels. Note however, that this specification does **not** provide any guidance as to how the vessel or its Master are to process such advice. 

Whereas this document should be treated as the normative reference for the protocols described, the accompanying reference implementations should be seen as non-normative, informal, "best-effort" interpretations of this specification. However, these implementations can be used as a basis for formalized compliancy testing. It is envisioned that ship classification companies will engage in such compliancy tests and then maritime operators should use only certified implementations in actual operations.

### Related work and standards
The protocols specified here build upon exisiting standards, the aim is to enable implementations built using well-tested, freely available components as much as possible.
Standards of particular relevance include: 
* *NMEA*, for the message format of bridge information
* *Asterix* for radar signals
* general internet standards including, but not limited to, *HTTP*, *WebRTC* and *WebSockets*, and *AV1*

## System architecture

This **informative** section outlines how the protocol specifications are intended to be used by the various parties. This short overview also serves to delineate the scope.

The *Vessel* is exepected to contact a *Maritime Operating Centre* (abbrev *MOC*) whenever it (or its crew) decides there is reason to do so. Also, it is foreseen that in the future authorities may require vessels that enter certain designated areas to contact a prescribed MOC, not unlike current requirements to contact a VTS, or request a pilot. In any case the first step (step 1) is for the Vessel to inform a MOC of its readiness and capabilities for remote operations, and optionally of its need for guidance. The MOC acts as a server and acknowledges the message (1) of the Vessel. During this phase the Vessel and the MOC establish a communication channel.

If and when deemed apprpriate the MOC will, using this communication channel, request the Vessel to start streaming one or more *sources* (step 2) of onboard information, taking into account the needs of both the Vessel as well as the MOC. The onboard information sources that the Vessel can convey to the MOC will always include the current navigational data (_conning_ information), such as the position, heading, speed, rate of turn, etc. Vessels may also be able to stream a live radar signal, and signals from video cameras.

In case a Vessel requested guidance the MOC can send advisory messages (step 3) through the communications channel that was set up in step 1.

Either the Vessel or the MOC can at any point decide to end the communication, and are expected to do so in an orderly manner through specified messages (step 4) send through the communications channel.

The whole process is similar to a video call, with possibly camera and screen sharing, between two persons each with a computer. Where e.g. Person V uses a chat facility to let person M know that she can be called, and how. Person M then calls V who has her microphone and camera enabled, and upon request from M (in the chat) shares a window of her screen. In this analogy "microphone" maps to conning info, camera to a video and the shared window to e.g. a radar signal. Note that M "is on mute", but continues to communicate using the chat facility, e.g. to help her out. And either V or M can "hang up", i.e. end the call, but will chat about that intention before they do so.

The architecture then relies on recently developed, but well-established, protocols for remote, internet-based, video calls and similar real-time streamed data. Briefly (again, this is informative) as follows:

  1. The Vessel opens a **web socket** to the **HTTP server** operated by the MOC, and uses the socket to send messages to the MOC, notably the message to inform the MOC about its capabilities.

  2. The MOC can request the Vessel to open a **WebRTC connection** for one or more of the data sources of the Vessel. So in addition to acting as the signalling server the MOC is now also a _WebRTC peer_ of the Vessel. The peer and signalling server don't have to be the same machine, or on the same IP address, but should be part of the same (legal) organization.

  3. The MOC may send advisory messages through the web socket.

  4. The Vessel or MOC inform the other party about the intent to "hang up" with a message through the web socket.

The HTTP, Web Socket and WebRTC standards already specificy most of the important lower-level connectivity aspects including, but not limmited to, negotiation of the best bit-rate (and e.g. video resolution), upgrading/downgrading live connections, end-to-end message integrity and other basic security, etc. Nevertheless the Vessel and MOC need to be in agreement on how to use these technologies _exactly_ to ensure flawless interoperability. That agreement is the scope of this specification.

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
- a *status* report
- *capabilities* for real-time connections, and possibly ship control
- requested *advice*

The vessel then MUST send a status message at least every 5 seconds, but not more frequently then every 2 seconds.
Message with capabilities and request for advice, and both an up-to-date AIS status report (AIS message type 1 or 3) as well as an AIS static data message (AIS message type 5)
Vessel sends regular updates with position, cog, sog, heading? and status, ais message or nmea messages
MOC request to open WebRTC connections, ice, offers (conning, radar, etc.)
Hang-up

### Messages

#### capabilities
#### guidance
#### nmea
#### sk
#### predictor?
#### route

#### request
####

## 2. Real-time connections

### conning
#### predictor?

### radar

### video

### audio?


## 3. Navigation messages

### conning (from Vessel to MOC)

### advice (from MOC to Vessel)


## Security considerations


## Implementation considerations


## References

[RFC2119]
  [Key words for use in RFCs to Indicate Requirement Levels](https://www.rfc-editor.org/rfc/rfc2119.txt), S. Bradner. The Internet Society, March 1997.

[RFC8307]
  [Well-Known URIs for the WebSocket Protocol](https://tools.ietf.org/html/rfc8307), C. Bormann, Universitaet Bremen TZI, January 2018.

[M.585-8]
  [Recommendation ITU-R M.585-8, Assignment and use of identities in the
maritime mobile service (10/2019)](https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.585-8-201910-I!!PDF-E.pdf)