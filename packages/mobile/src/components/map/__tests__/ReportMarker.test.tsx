import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReportMarker } from '../ReportMarker';
import { CATEGORY_COLORS } from '../../../constants/map';
import { Report } from '@hoohacks26/shared';

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Marker = ({ testID, coordinate, pinColor, onPress, children }: any) =>
    React.createElement(
      View,
      {
        testID,
        onTouchEnd: onPress,
        'data-coordinate': JSON.stringify(coordinate),
        'data-pin-color': pinColor,
      },
      children
    );
  const Circle = ({ testID, center, radius }: any) =>
    React.createElement(View, { testID, 'data-center': JSON.stringify(center), 'data-radius': radius });
  return {
    __esModule: true,
    default: ({ children, testID }: any) => React.createElement(View, { testID }, children),
    Marker,
    Circle,
  };
});

const makeReport = (overrides: Partial<Report> = {}): Report => ({
  id: 'r1',
  reporterId: 'u1',
  category: 'CRIME',
  severity: 'HIGH',
  title: 'Suspicious person',
  latitude: 38.0321,
  longitude: -78.5092,
  radiusMeters: 300,
  credibilityWeight: 1.0,
  confirmationCount: 2,
  status: 'ACTIVE',
  adminVerified: false,
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('ReportMarker', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <ReportMarker report={makeReport()} onPress={jest.fn()} />
    );
    expect(getByTestId('report-marker-r1')).toBeTruthy();
  });

  it('uses correct pin color for CRIME category', () => {
    const { getByTestId } = render(
      <ReportMarker report={makeReport({ category: 'CRIME' })} onPress={jest.fn()} />
    );
    expect(getByTestId('report-marker-r1').props['data-pin-color']).toBe(CATEGORY_COLORS.CRIME);
  });

  it('uses correct pin color for EMERGENCY category', () => {
    const { getByTestId } = render(
      <ReportMarker report={makeReport({ category: 'EMERGENCY', id: 'r-em' })} onPress={jest.fn()} />
    );
    expect(getByTestId('report-marker-r-em').props['data-pin-color']).toBe(CATEGORY_COLORS.EMERGENCY);
  });

  it('uses correct pin color for WEATHER category', () => {
    const { getByTestId } = render(
      <ReportMarker report={makeReport({ category: 'WEATHER', id: 'r-we' })} onPress={jest.fn()} />
    );
    expect(getByTestId('report-marker-r-we').props['data-pin-color']).toBe(CATEGORY_COLORS.WEATHER);
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ReportMarker report={makeReport()} onPress={onPress} />
    );
    fireEvent(getByTestId('report-marker-r1'), 'touchEnd');
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders at the report coordinates', () => {
    const { getByTestId } = render(
      <ReportMarker report={makeReport({ latitude: 38.0321, longitude: -78.5092 })} onPress={jest.fn()} />
    );
    const coord = JSON.parse(getByTestId('report-marker-r1').props['data-coordinate']);
    expect(coord).toEqual({ latitude: 38.0321, longitude: -78.5092 });
  });
});
