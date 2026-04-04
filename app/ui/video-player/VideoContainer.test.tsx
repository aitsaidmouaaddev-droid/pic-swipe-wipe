import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import ThemeProvider from "@themes/ThemeContext";
import { useEventListener } from "expo";
import { createVideoPlayer } from "expo-video";
import React from "react";
import VideoContainer from "./VideoContainer";

// 1. Correction des Mocks pour retourner un "Default Export"
jest.mock("./VideoGestures", () => {
  const React = require("react");
  const { View } = require("react-native");
  // Retourne directement la fonction ou un objet avec la clé 'default'
  return (props: any) => <View testID="video-gestures" {...props} />;
});

jest.mock("./VideoProgressBar", () => {
  const React = require("react");
  const { View } = require("react-native");
  return (props: any) => <View testID="video-progress-bar" {...props} />;
});

// Mock Button
jest.mock("@ui/button/Button", () => {
  const React = require("react");
  const { Pressable } = require("react-native");
  return (props: any) => (
    <Pressable testID={props.testID ?? "mute-button"} onPress={props.onPress} />
  );
});

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const flushMicrotasks = () => new Promise((r) => setImmediate(r));

const getListener = (eventName: string) => {
  const call = (useEventListener as jest.Mock).mock.calls.find((c) => c[1] === eventName);
  return call?.[2];
};

describe("VideoContainer", () => {
  const mockUri = "test.mp4";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("⏯️ Gère le Play/Pause via un simple tap", async () => {
    const { getByTestId } = renderWithTheme(
      <VideoContainer uri={mockUri} isActive={true} tabBarHeight={60} />,
    );

    await act(async () => {
      await flushMicrotasks();
    });

    const player = (createVideoPlayer as jest.Mock).mock.results[0].value;
    const gestures = getByTestId("video-gestures");

    // Force state so we test PAUSE path
    player.playing = true;

    act(() => {
      gestures.props.onTogglePlay();
    });

    expect(player.pause).toHaveBeenCalled();

    // Force state so we test PLAY path
    player.playing = false;

    act(() => {
      gestures.props.onTogglePlay();
    });

    expect(player.play).toHaveBeenCalled();
  });

  it("🔊 Bascule le mode Mute via le bouton dédié", async () => {
    const { getByTestId } = renderWithTheme(
      <VideoContainer uri={mockUri} isActive={true} tabBarHeight={60} />,
    );

    await act(async () => {
      await flushMicrotasks();
    });

    const player = (createVideoPlayer as jest.Mock).mock.results[0].value;
    const muteButton = getByTestId("mute-button");

    act(() => {
      fireEvent.press(muteButton);
    });

    await waitFor(() => {
      expect(player.muted).toBe(true);
    });
  });

  it("⏩ Effectue un Seek sur double tap", async () => {
    const { getByTestId } = renderWithTheme(
      <VideoContainer uri={mockUri} isActive={true} tabBarHeight={60} />,
    );

    await act(async () => {
      await flushMicrotasks();
    });

    const player = (createVideoPlayer as jest.Mock).mock.results[0].value;
    const gestures = getByTestId("video-gestures");

    act(() => {
      gestures.props.onSeek(3);
    });

    expect(player.seekBy).toHaveBeenCalledWith(3);
  });

  it("📊 Met à jour la vidéo lors du Scrubbing manuel", async () => {
    const { getByTestId } = renderWithTheme(
      <VideoContainer uri={mockUri} isActive={true} tabBarHeight={60} />,
    );

    await act(async () => {
      await flushMicrotasks();
    });

    // ✅ simulate loaded duration = 10
    const sourceLoadCb = getListener("sourceLoad");
    expect(typeof sourceLoadCb).toBe("function");

    act(() => {
      sourceLoadCb({ duration: 10 });
    });

    const player = (createVideoPlayer as jest.Mock).mock.results[0].value;
    const progressBar = getByTestId("video-progress-bar");

    act(() => {
      progressBar.props.onScrub(0.5);
    });

    expect(player.currentTime).toBe(5);
  });

  it("📈 La barre de progression suit la lecture de la vidéo", async () => {
    const { getByTestId } = renderWithTheme(
      <VideoContainer uri={mockUri} isActive={true} tabBarHeight={60} />,
    );

    await act(async () => {
      await flushMicrotasks();
    });

    // ✅ duration first
    const sourceLoadCb = getListener("sourceLoad");
    act(() => {
      sourceLoadCb({ duration: 10 });
    });

    // ✅ then time update
    const timeUpdateCb = getListener("timeUpdate");
    expect(typeof timeUpdateCb).toBe("function");

    act(() => {
      timeUpdateCb({ currentTime: 3 });
    });

    const progressBar = getByTestId("video-progress-bar");
    expect(progressBar.props.progress).toBe(0.3);
  });
});
