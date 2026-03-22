import React from 'react';
import { render } from '@testing-library/react-native';
import { RadiusCircle } from '../RadiusCircle';

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Marker = ({ testID, coordinate, children }: any) =>
    React.createElement(View, { testID, 'data-coordinate': JSON.stringify(coordinate) }, children);
  const Circle = ({ testID, center, radius, strokeColor, fillColor }: any) =>
    React.createElement(View, {
      testID,
      'data-center': JSON.stringify(center),
      'data-radius': radius,
      'data-stroke-color': strokeColor,
      'data-fill-color': fillColor,
    });
  return {
    __esModule: true,
    default: ({ children, testID }: any) => React.createElement(View, { testID }, children),
    Marker,
    Circle,
  };
});

describe('RadiusCircle', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <RadiusCircle latitude={38.0336} longitude={-78.508} radiusMeters={500} />
    );
    expect(getByTestId('radius-circle')).toBeTruthy();
  });

  it('passes correct radius to Circle', () => {
    const { getByTestId } = render(
      <RadiusCircle latitude={38.0336} longitude={-78.508} radiusMeters={1500} />
    );
    expect(getByTestId('radius-circle').props['data-radius']).toBe(1500);
  });

  it('passes correct center coordinates to Circle', () => {
    const { getByTestId } = render(
      <RadiusCircle latitude={38.0321} longitude={-78.5092} radiusMeters={300} />
    );
    const center = JSON.parse(getByTestId('radius-circle').props['data-center']);
    expect(center).toEqual({ latitude: 38.0321, longitude: -78.5092 });
  });

  it('uses custom strokeColor when provided', () => {
    const { getByTestId } = render(
      <RadiusCircle
        latitude={38.0336}
        longitude={-78.508}
        radiusMeters={500}
        strokeColor="#FF0000"
      />
    );
    expect(getByTestId('radius-circle').props['data-stroke-color']).toBe('#FF0000');
  });

  it('uses default strokeColor when not provided', () => {
    const { getByTestId } = render(
      <RadiusCircle latitude={38.0336} longitude={-78.508} radiusMeters={500} />
    );
    expect(getByTestId('radius-circle').props['data-stroke-color']).toBeTruthy();
  });
});
