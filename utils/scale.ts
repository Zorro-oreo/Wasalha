import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const REFERENCE_WIDTH = 402;

export const scale = (size: number) => (SCREEN_WIDTH / REFERENCE_WIDTH) * size;