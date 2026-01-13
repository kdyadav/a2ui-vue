<script setup>
/**
 * Media Player Example - Audio/Video player with controls
 */
import { reactive } from 'vue';
import A2UISurface from '../A2UISurface.vue';

const data = reactive({
  volume: 75,
  currentTrack: 0,
  isPlaying: false,
  playlist: [
    { title: 'Morning Jazz', artist: 'Jazz Collective', duration: '4:32' },
    { title: 'Chill Beats', artist: 'Lo-Fi Station', duration: '3:45' },
    { title: 'Focus Flow', artist: 'Study Music', duration: '5:12' }
  ]
});

const components = {
  'root': { Column: { children: { explicitList: ['player-card', 'playlist-card'] } } },
  
  // Player Card
  'player-card': { Card: { child: 'player-content' } },
  'player-content': { Column: { alignment: 'center', children: { explicitList: ['album-art', 'track-info', 'controls', 'volume-row'] } } },
  'album-art': { Image: { url: { literalString: 'https://picsum.photos/200/200?random=1' }, usageHint: 'hero', alt: { literalString: 'Album artwork' } } },
  'track-info': { Column: { alignment: 'center', children: { explicitList: ['track-title', 'track-artist'] } } },
  'track-title': { Text: { text: { literalString: 'Morning Jazz' }, usageHint: 'h2' } },
  'track-artist': { Text: { text: { literalString: 'Jazz Collective' }, usageHint: 'caption' } },
  
  // Playback Controls
  'controls': { Row: { alignment: 'center', distribution: 'center', children: { explicitList: ['prev-btn', 'play-btn', 'next-btn'] } } },
  'prev-btn': { Button: { child: 'prev-icon', action: { name: 'prev' }, ariaLabel: 'Previous' } },
  'prev-icon': { Icon: { name: 'skip_previous' } },
  'play-btn': { Button: { child: 'play-icon', action: { name: 'playPause' }, ariaLabel: 'Play/Pause' } },
  'play-icon': { Icon: { name: 'play_arrow' } },
  'next-btn': { Button: { child: 'next-icon', action: { name: 'next' }, ariaLabel: 'Next' } },
  'next-icon': { Icon: { name: 'skip_next' } },
  
  // Volume Control
  'volume-row': { Row: { alignment: 'center', children: { explicitList: ['volume-icon', 'volume-slider'] } } },
  'volume-icon': { Icon: { name: 'volume_up' } },
  'volume-slider': { Slider: { label: '', minValue: 0, maxValue: 100, value: { path: '/volume' } } },
  
  // Playlist Card
  'playlist-card': { Card: { child: 'playlist-content' } },
  'playlist-content': { Column: { children: { explicitList: ['playlist-header', 'playlist-divider', 'track1', 'track2', 'track3'] } } },
  'playlist-header': { Row: { alignment: 'center', children: { explicitList: ['playlist-icon', 'playlist-title'] } } },
  'playlist-icon': { Icon: { name: 'queue_music' } },
  'playlist-title': { Text: { text: { literalString: 'Playlist' }, usageHint: 'caption' } },
  'playlist-divider': { Divider: {} },
  
  // Track rows
  'track1': { Button: { child: 'track1-row', action: { name: 'selectTrack', context: [{ key: 'index', value: { literalNumber: 0 } }] }, ariaLabel: 'Play Morning Jazz' } },
  'track1-row': { Row: { alignment: 'center', distribution: 'spaceBetween', children: { explicitList: ['track1-info', 'track1-dur'] } } },
  'track1-info': { Column: { children: { explicitList: ['track1-name', 'track1-artist'] } } },
  'track1-name': { Text: { text: { literalString: 'Morning Jazz' } } },
  'track1-artist': { Text: { text: { literalString: 'Jazz Collective' }, usageHint: 'caption' } },
  'track1-dur': { Text: { text: { literalString: '4:32' }, usageHint: 'caption' } },
  
  'track2': { Button: { child: 'track2-row', action: { name: 'selectTrack', context: [{ key: 'index', value: { literalNumber: 1 } }] }, ariaLabel: 'Play Chill Beats' } },
  'track2-row': { Row: { alignment: 'center', distribution: 'spaceBetween', children: { explicitList: ['track2-info', 'track2-dur'] } } },
  'track2-info': { Column: { children: { explicitList: ['track2-name', 'track2-artist'] } } },
  'track2-name': { Text: { text: { literalString: 'Chill Beats' } } },
  'track2-artist': { Text: { text: { literalString: 'Lo-Fi Station' }, usageHint: 'caption' } },
  'track2-dur': { Text: { text: { literalString: '3:45' }, usageHint: 'caption' } },
  
  'track3': { Button: { child: 'track3-row', action: { name: 'selectTrack', context: [{ key: 'index', value: { literalNumber: 2 } }] }, ariaLabel: 'Play Focus Flow' } },
  'track3-row': { Row: { alignment: 'center', distribution: 'spaceBetween', children: { explicitList: ['track3-info', 'track3-dur'] } } },
  'track3-info': { Column: { children: { explicitList: ['track3-name', 'track3-artist'] } } },
  'track3-name': { Text: { text: { literalString: 'Focus Flow' } } },
  'track3-artist': { Text: { text: { literalString: 'Study Music' }, usageHint: 'caption' } },
  'track3-dur': { Text: { text: { literalString: '5:12' }, usageHint: 'caption' } }
};

const handleAction = (action) => {
  console.log('[Player] Action:', action);
  if (action.name === 'playPause') {
    data.isPlaying = !data.isPlaying;
    console.log(data.isPlaying ? 'Playing' : 'Paused');
  } else if (action.name === 'next') {
    data.currentTrack = (data.currentTrack + 1) % data.playlist.length;
  } else if (action.name === 'prev') {
    data.currentTrack = (data.currentTrack - 1 + data.playlist.length) % data.playlist.length;
  } else if (action.name === 'selectTrack') {
    data.currentTrack = action.context?.index ?? 0;
  }
};

const handleDataUpdate = ({ path, value }) => {
  if (path === '/volume') data.volume = value;
};
</script>

<template>
  <div class="media-example">
    <A2UISurface componentId="root" :components="components" :data="data" surfaceId="media"
      @action="handleAction" @dataUpdate="handleDataUpdate" />
    <p class="status">Volume: {{ data.volume }}% | Track: {{ data.playlist[data.currentTrack]?.title }}</p>
  </div>
</template>

<style scoped>
.media-example { max-width: 400px; margin: 2rem auto; padding: 1rem; }
.status { text-align: center; color: #6b7280; font-size: 0.875rem; margin-top: 1rem; }
</style>

