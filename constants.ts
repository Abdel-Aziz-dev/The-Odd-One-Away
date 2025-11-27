import {
  Apple, Banana, Cherry, Grape, Pizza, Croissant, Coffee, 
  Car, Bike, Plane, Rocket, Anchor,
  Heart, Star, Zap, Cloud, Sun, Moon,
  Cat, Dog, Fish, Bird, Bug,
  Music, Camera, Gamepad, Headphones,
  Umbrella, Key, Lock, Bell, Gift,
  LucideIcon
} from 'lucide-react';
import { Theme } from './types';

// Map of icon names to components for serialization/randomization
export const ICON_MAP: Record<string, LucideIcon> = {
  Apple, Banana, Cherry, Grape, Pizza, Croissant, Coffee,
  Car, Bike, Plane, Rocket, Anchor,
  Heart, Star, Zap, Cloud, Sun, Moon,
  Cat, Dog, Fish, Bird, Bug,
  Music, Camera, Gamepad, Headphones,
  Umbrella, Key, Lock, Bell, Gift
};

export const ICON_KEYS = Object.keys(ICON_MAP);

export const THEMES: Theme[] = [
  {
    id: 'neon_cyber',
    name: 'Neon Cyber',
    background: 'bg-slate-900',
    surface: 'bg-slate-800',
    accent: 'text-cyan-400',
    text: 'text-white',
    itemColors: ['text-cyan-400', 'text-fuchsia-400', 'text-yellow-400', 'text-emerald-400']
  },
  {
    id: 'minimal_white',
    name: 'Minimalist',
    background: 'bg-gray-100',
    surface: 'bg-white',
    accent: 'text-indigo-600',
    text: 'text-gray-900',
    itemColors: ['text-indigo-500', 'text-rose-500', 'text-amber-500', 'text-teal-500']
  },
  {
    id: 'forest_nature',
    name: 'Forest',
    background: 'bg-green-900',
    surface: 'bg-green-800',
    accent: 'text-lime-400',
    text: 'text-green-50',
    itemColors: ['text-lime-400', 'text-green-400', 'text-amber-300', 'text-orange-400']
  },
  {
    id: 'candy_pop',
    name: 'Candy Pop',
    background: 'bg-pink-100',
    surface: 'bg-white',
    accent: 'text-pink-500',
    text: 'text-pink-900',
    itemColors: ['text-pink-500', 'text-purple-500', 'text-blue-400', 'text-yellow-400']
  }
];

export const XP_PER_LEVEL = 100;
export const STREAK_BONUS = 10;
