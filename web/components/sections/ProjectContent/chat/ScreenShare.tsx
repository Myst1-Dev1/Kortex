"use client";

import { Maximize2, MonitorUp, MonitorX } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const screenRtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  bundlePolicy: "max-bundle",
  iceCandidatePoolSize: 10,
};

export interface ScreenShareSignal {
  senderSocketId: string;
  signal: {
    media?: string;
    type: "offer" | "answer" | "candidate" | "stop";
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
  };
}

export interface ScreenShareHandle {
  handleSignal: (data: ScreenShareSignal) => void;
  shareWith: (socketId: string) => void;
}

interface ScreenShareProps {
  isInVoice: boolean;
  getPeerIds: () => string[];
  sendSignal: (targetSocketId: string, signal: ScreenShareSignal["signal"]) => void;
}

export const ScreenShare = forwardRef<ScreenShareHandle, ScreenShareProps>(
  function ScreenShare({ isInVoice, getPeerIds, sendSignal }, ref) {
    const [isSharing, setIsSharing] = useState(false);
    const [remoteScreens, setRemoteScreens] = useState<Record<string, MediaStream>>({});
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<Record<string, RTCPeerConnection>>({});
    const pendingCandidatesRef = useRef<Record<string, RTCIceCandidateInit[]>>({});
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoContainerRef = useRef<HTMLDivElement>(null);
    const remoteVideoContainersRef = useRef<Record<string, HTMLDivElement>>({});

    const toggleFullscreen = async (element: HTMLElement | null) => {
      if (!element) return;

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await element.requestFullscreen();
      }
    };

    const closeRemotePeer = (socketId: string) => {
      peersRef.current[socketId]?.close();
      delete peersRef.current[socketId];
      delete pendingCandidatesRef.current[socketId];
      setRemoteScreens((previous) => {
        const next = { ...previous };
        delete next[socketId];
        return next;
      });
    };

    const createPeer = (socketId: string, initiator: boolean) => {
      const existingPeer = peersRef.current[socketId];
      if (existingPeer) return existingPeer;

      const peer = new RTCPeerConnection(screenRtcConfig);
      peersRef.current[socketId] = peer;

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal(socketId, {
            media: "screen",
            type: "candidate",
            candidate: event.candidate.toJSON(),
          });
        }
      };

      peer.ontrack = (event) => {
        const stream = event.streams[0];
        if (stream) {
          setRemoteScreens((previous) => ({ ...previous, [socketId]: stream }));
        }
      };

      if (initiator && localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peer.addTrack(track, localStreamRef.current as MediaStream);
        });
      }

      return peer;
    };

    const shareWith = async (socketId: string) => {
      if (!localStreamRef.current) return;

      const peer = createPeer(socketId, true);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      sendSignal(socketId, {
        media: "screen",
        type: "offer",
        sdp: peer.localDescription ?? offer,
      });
    };

    const startSharing = async () => {
      if (!isInVoice) return;

      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: 30, max: 30 },
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
          },
          audio: true,
        });

        localStreamRef.current = stream;
        setIsSharing(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        stream.getVideoTracks()[0].addEventListener("ended", stopSharing);

        for (const socketId of getPeerIds()) await shareWith(socketId);
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          console.error("Erro ao compartilhar a tela:", error);
        }
      }
    };

    const stopSharing = () => {
      for (const socketId of Object.keys(peersRef.current)) {
        sendSignal(socketId, { media: "screen", type: "stop" });
        peersRef.current[socketId].close();
      }

      peersRef.current = {};
      pendingCandidatesRef.current = {};
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setIsSharing(false);
      setRemoteScreens({});
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    };

    useImperativeHandle(ref, () => ({
      shareWith: (socketId) => {
        void shareWith(socketId);
      },
      handleSignal: async ({ senderSocketId, signal }) => {
        if (signal.media !== "screen") return;

        if (signal.type === "stop") {
          closeRemotePeer(senderSocketId);
          return;
        }

        const peer = createPeer(senderSocketId, false);
        if (signal.type === "offer" && signal.sdp) {
          await peer.setRemoteDescription(signal.sdp);

          const pendingCandidates = pendingCandidatesRef.current[senderSocketId] ?? [];
          for (const candidate of pendingCandidates) {
            await peer.addIceCandidate(candidate);
          }
          delete pendingCandidatesRef.current[senderSocketId];

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          sendSignal(senderSocketId, {
            media: "screen",
            type: "answer",
            sdp: peer.localDescription ?? answer,
          });
        } else if (signal.type === "answer" && signal.sdp) {
          await peer.setRemoteDescription(signal.sdp);
        } else if (signal.type === "candidate" && signal.candidate) {
          if (peer.remoteDescription) {
            await peer.addIceCandidate(signal.candidate);
          } else {
            pendingCandidatesRef.current[senderSocketId] ??= [];
            pendingCandidatesRef.current[senderSocketId].push(signal.candidate);
          }
        }

        if (signal.type === "offer" || signal.type === "answer") {
          const pendingCandidates = pendingCandidatesRef.current[senderSocketId] ?? [];
          for (const candidate of pendingCandidates) {
            await peer.addIceCandidate(candidate);
          }
          delete pendingCandidatesRef.current[senderSocketId];
        }
      },
    }));

    useEffect(() => {
      return () => {
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        Object.values(peersRef.current).forEach((peer) => peer.close());
      };
    }, []);

    return (
      <>
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={isSharing ? stopSharing : startSharing}
            disabled={!isInVoice}
            title={
              !isInVoice
                ? "Entre no canal de voz primeiro"
                : isSharing
                  ? "Parar compartilhamento de tela"
                  : "Compartilhar tela"
            }
            className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              isSharing
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white text-gray-700 shadow-sm hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {isSharing ? <MonitorX className="h-3.5 w-3.5" /> : <MonitorUp className="h-3.5 w-3.5" />}
            {isSharing ? "Parar tela" : "Compartilhar tela"}
          </button>
          {isSharing && <span className="text-[10px] text-red-600 dark:text-red-300">Transmitindo</span>}
        </div>

        {(isSharing || Object.keys(remoteScreens).length > 0) && (
          <div className="grid gap-2 border-b border-gray-100 bg-black p-2 dark:border-gray-700">
            {isSharing && (
              <div
                ref={localVideoContainerRef}
                className="group relative overflow-hidden rounded-md bg-black [&:fullscreen]:flex [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:items-center [&:fullscreen]:justify-center [&:fullscreen]:rounded-none [&:fullscreen>video]:h-full [&:fullscreen>video]:max-h-full [&:fullscreen>video]:w-full"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="max-h-48 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => void toggleFullscreen(localVideoContainerRef.current)}
                  title="Expandir tela compartilhada"
                  className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            )}
            {Object.entries(remoteScreens).map(([socketId, stream]) => (
              <div
                key={socketId}
                ref={(element) => {
                  if (element) remoteVideoContainersRef.current[socketId] = element;
                }}
                className="group relative overflow-hidden rounded-md bg-black [&:fullscreen]:flex [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:items-center [&:fullscreen]:justify-center [&:fullscreen]:rounded-none [&:fullscreen>video]:h-full [&:fullscreen>video]:max-h-full [&:fullscreen>video]:w-full"
              >
                <video
                  autoPlay
                  playsInline
                  ref={(element) => {
                    if (element && element.srcObject !== stream) element.srcObject = stream;
                  }}
                  className="max-h-48 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => void toggleFullscreen(remoteVideoContainersRef.current[socketId])}
                  title="Expandir tela compartilhada"
                  className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }
);
