import React from 'react';
import { render } from '@testing-library/react-native';
import { UserMarker } from '../UserMarker';

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Marker = ({ testID, coordinate, children }: any) =>
    React.createElement(View, { testID, 'data-coordinate': JSON.stringify(coordinate) }, children);
  const Circle = ({ testID, center, radius }: any) =>
    React.createElement(View, { testID, 'data-center': JSON.stringify(center), 'data-radius': radius });
  return {
    __esModule: true,
    default: ({ children, testID }: any) => React.createElement(View, { testID }, children),
    Marker,
    Circle,
  };
});

describe('UserMarker', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <UserMarker latitude={38.0336} longitude={-78.508} />
    );
    expect(getByTestId('user-marker')).toBeTruthy();
  });

  it('renders at the provided coordinates', () => {
    const { getByTestId } = render(
      <UserMarker latitude={38.0336} longitude={-78.508} />
    );
    const marker = getByTestId('user-marker');
    const coord = JSON.parse(marker.props['data-coordinate']);
    expect(coord).toEqual({ latitude: 38.0336, longitude: -78.508 });
  });
});
