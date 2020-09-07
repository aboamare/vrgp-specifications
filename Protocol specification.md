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

The *Vessel* is exepected to contact a Maritime *Remote Operating Centre* (abbrev *ROC*) whenever it (or its crew) decides there is reason to do so. Also, it is foreseen that in the future authorities may require vessels that enter certain designated areas to contact a prescribed ROC, not unlike current requirements to contact a VTS, or request a pilot. In any case the first step (1) is for the Vessel to inform a ROC of its readiness and capabilities for remote operations, and optionally of its need for guidance. The ROC acts as a server and acknowledges the message (1) of the Vessel. During this phase the Vessel and the ROC establish a communication channel.

If and when deemed apprpriate the ROC will, using this communication channel, request the Vessel to start streaming one or more *sources* (2) of onboard information, taking into account the needs of both the Vessel as well as the ROC. The onboard information sources that the Vessel can convey to the ROC will always include the current navigational data (_conning_ information), such as the position, heading, speed, rate of turn, etc. Vessels may also be able to stream a live radar signal, and signals from video cameras.

In case a Vessel requested guidance the ROC can send advisory messages (3) through the communications channel that was set up in step 1.

Either the Vessel or the ROC can at any point decide to end the communication, and are expected to do so in an orderly manner through specified messages (4) send through the communications channel.

The whole process is similar to a video call, with possibly camera and screen sharing, between two persons each with a computer. Where e.g. Person V uses a chat facility to let person R know that she can be called, and how. Person R then calls V who has her microphone and camera enabled, and upon request from R (in the chat) shares a window of her screen. In this analogy "microphone" maps to conning info, camera to a video and the shared window to e.g. a radar signal. Note that R "is on mute", but continues to communicate using the chat facility, e.g. to help her out. And either V or R can "hang up", i.e. end the call, but will chat about that intention before they do so.

The architecture then relies on recently developed, but well-established, protocols for remote, internet-based, video calls and similar real-time atreamed data. Briefly (again, this is non-normative) as follows:

  1. The Vessel opens a **web socket** to the **HTTP server** operated by the ROC, and uses the socket to send messages to the ROC, notably the message to inform the ROC about its capabilities.

  2. The ROC can request the Vessel to open a **WebRTC connection** for one or more of the data sources of the Vessel. So in addition to acting as the signalling server the ROC is now also a _WebRTC peer_ of the Vessel. 

  3. The ROC may send advisory messages through the web socket.

  4. The Vessel or ROC inform the other party about the intent to "hang up" with a message through the web socket.

The HTTP, Web Socket and WebRTC standards already apecificy most of the important lower-level connectivity aspects including, but not limmited to, negotiation of the best bit-rate (and e.g. video resolution), upgrading/downgrading live connections, end-to-end message integrity and other basic security, etc. Nevertheless the Vessel and ROC need to be in agreement on how to use these technologies _exactly_ to ensure flawless interoperability. That agreement is the scope of this specification.

## Scope

The scope of this specification is to precisely define the _use_ of a suite of existing (web) API and protocol specifications to ensure interoperability between a Vessel and a ROC where the Vessel wishes to provide the ROC with real-time rich data so that an ROC can provide navigational advice to a Vessel. 

The protocols that will be used include HTTP, Web Socket and WebRTC, and of course to some degree the protocols that these depend on. Some _examples_ of what this specifiation needs to address include: 

- ensure that the Vessel communicates with a trustworthy ROC.
- establish a standard naming of data sources, to indicate e.g. the onboard position of a video camera.
- the various sources will require different types of WebRTC connections, these types and their parameters need to be specified; including e.g. video codecs that should be used.
- the structure and content of the signalling and navigational messages must be defined.


## Definitions
- *vessel* 


## 1. Signalling protocol

Check server certificate
Open web socket
Message with capabilities and request for advice
ROC request to open WebRTC connections
Hang-up


## 2. Real-time connections

### conning

### radar

### video

### audio?


## 3. Navigation messages

### conning (from Vessel to ROC)

### advice (from ROC to Vessel)


## Security considerations


## Implementation considerations


## References

[RFC2119]
  [Key words for use in RFCs to Indicate Requirement Levels](https://www.rfc-editor.org/rfc/rfc2119.txt), S. Bradner. The Internet Society, March 1997.