export const SignalingMessageType = {
  JOIN_ROOM: "join_room",
  ROOM_JOINED: "room_joined",
  PEER_JOINED: "peer_joined",
  OFFER: "offer",
  ANSWER: "answer",
  ICE_CANDIDATE: "ice_candidate",
  PEER_LEFT: "peer_left",
  ERROR: "error",
} as const;

export type SignalingMessageType =
  (typeof SignalingMessageType)[keyof typeof SignalingMessageType];

export interface BaseSignalingMessage {
  type: SignalingMessageType;
  roomId: string;
}

export interface JoinRoomMessage extends BaseSignalingMessage {
  type: typeof SignalingMessageType.JOIN_ROOM;
  peerId: string;
}

export interface RoomJoinedMessage extends BaseSignalingMessage {
  type: typeof SignalingMessageType.ROOM_JOINED;
  peerId: string;
}

export interface PeerJoinedMessage extends BaseSignalingMessage {
  type: typeof SignalingMessageType.PEER_JOINED;
  peerId: string;
}

export interface OfferMessage extends BaseSignalingMessage {
  type: typeof SignalingMessageType.OFFER;
  offer: RTCSessionDescriptionInit;
  from: string;
}

export interface AnswerMessage extends BaseSignalingMessage {
  type: typeof SignalingMessageType.ANSWER;
  answer: RTCSessionDescriptionInit;
  from: string;
}

export interface IceCandidateMessage extends BaseSignalingMessage {
  type: typeof SignalingMessageType.ICE_CANDIDATE;
  candidate: RTCIceCandidateInit;
  from: string;
}

export interface PeerLeftMessage extends BaseSignalingMessage {
  type: typeof SignalingMessageType.PEER_LEFT;
  peerId: string;
}

export interface ErrorMessage extends BaseSignalingMessage {
  type: typeof SignalingMessageType.ERROR;
  error: string;
}

export type SignalingMessage =
  | JoinRoomMessage
  | RoomJoinedMessage
  | PeerJoinedMessage
  | OfferMessage
  | AnswerMessage
  | IceCandidateMessage
  | PeerLeftMessage
  | ErrorMessage;

export interface QRCodeData {
  version: string;
  roomId: string;
  signalingUrl: string;
  timestamp: number;
}
