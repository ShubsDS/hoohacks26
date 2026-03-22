import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Report } from '../../stores/reports.store';
import SeverityBadge from '../ui/SeverityBadge';
import { CATEGORY_COLORS, UVA_NAVY } from '../../lib/constants';

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString();
}

interface Props {
  report: Report;
  onPress: () => void;
}

export default function ReportCard({ report, onPress }: Props) {
  const categoryColor = CATEGORY_COLORS[report.category] || '#999';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.categoryStripe, { backgroundColor: categoryColor }]}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.category}>{report.category}</Text>
          <SeverityBadge severity={report.severity} />
          <View style={{ flex: 1 }} />
          <Text style={styles.time}>
            {formatTimeAgo(report.createdAt)}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {report.title}
        </Text>

        {report.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {report.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.reporter}>
            {report.reporter?.displayName || 'Anonymous'}
          </Text>
          <Text style={styles.confirmations}>
            {report.confirmationCount} confirmed
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryStripe: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    color: '#777',
    textTransform: 'uppercase',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: UVA_NAVY,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  reporter: {
    fontSize: 13,
    color: '#777',
  },
  confirmations: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },
});
