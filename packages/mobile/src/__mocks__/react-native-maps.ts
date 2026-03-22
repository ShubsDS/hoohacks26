import React from 'react';

const MapView = jest.fn(({ children, testID }: any) =>
  React.createElement('MapView', { testID }, children)
);

const Marker = jest.fn(({ children, testID, onPress, pinColor, coordinate }: any) =>
  React.createElement('Marker', { testID, onPress, pinColor, coordinate: JSON.stringify(coordinate) }, children)
);

const Circle = jest.fn(({ testID, center, radius }: any) =>
  React.createElement('Circle', { testID, center: JSON.stringify(center), radius })
);

MapView.Marker = Marker;
MapView.Circle = Circle;

export default MapView;
export { Marker, Circle };
