import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  CATEGORIES,
  SEVERITIES,
} from '../../lib/constants';
import { Colors, Fonts, Spacing, SeverityConfig, toSeverityLevel } from '../../theme/tokens';

export interface ReportFormData {
  category: string;
  severity: string;
  title: string;
  description: string;
  radiusMeters: number;
  imageUrl?: string;
}

interface Props {
  onSubmit: (data: ReportFormData) => void;
  loading?: boolean;
}

const RADIUS_OPTIONS = [
  { label: '25m', value: 25 },
  { label: '50m', value: 50 },
  { label: '100m', value: 100 },
  { label: '250m', value: 250 },
  { label: '500m', value: 500 },
];

const SEVERITY_BADGE_COLORS: Record<string, string> = {
  CRITICAL: Colors.severityCritical,
  HIGH: Colors.severityCritical,
  MEDIUM: Colors.severityWarning,
  LOW: Colors.textTertiary,
};

export default function ReportForm({ onSubmit, loading }: Props) {
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(500);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const canSubmit = category && title.trim().length > 0 && !loading;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.3,
      base64: true,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      if (asset.base64) {
        setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
      }
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      category,
      severity,
      title: title.trim(),
      description: description.trim(),
      radiusMeters,
      imageUrl: imageBase64 || undefined,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionLabel}>CATEGORY</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.chip,
              category === c && styles.chipActive,
            ]}
            onPress={() => setCategory(c)}
          >
            <Text
              style={[
                styles.chipText,
                category === c && styles.chipTextActive,
              ]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>SEVERITY</Text>
      <View style={styles.segmented}>
        {SEVERITIES.map((s) => {
          const badgeColor = SEVERITY_BADGE_COLORS[s] || Colors.textTertiary;
          return (
            <TouchableOpacity
              key={s}
              style={[
                styles.segment,
                severity === s && { borderColor: badgeColor, backgroundColor: `${badgeColor}20` },
              ]}
              onPress={() => setSeverity(s)}
            >
              <Text
                style={[
                  styles.segmentText,
                  severity === s && { color: badgeColor },
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>TITLE</Text>
      <TextInput
        style={styles.input}
        placeholder="What's happening? (max 80 chars)"
        placeholderTextColor={Colors.textMuted}
        value={title}
        onChangeText={(t) => setTitle(t.slice(0, 80))}
        maxLength={80}
      />
      <Text style={styles.charCount}>{title.length}/80</Text>

      <Text style={styles.sectionLabel}>DESCRIPTION</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Additional details... (max 300 chars)"
        placeholderTextColor={Colors.textMuted}
        value={description}
        onChangeText={(t) => setDescription(t.slice(0, 300))}
        maxLength={300}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>{description.length}/300</Text>

      <Text style={styles.sectionLabel}>PHOTO</Text>
      <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>+ Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      {imageUri && (
        <TouchableOpacity onPress={() => { setImageUri(null); setImageBase64(null); }}>
          <Text style={styles.removePhoto}>Remove photo</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionLabel}>RADIUS</Text>
      <View style={styles.chipRow}>
        {RADIUS_OPTIONS.map((r) => (
          <TouchableOpacity
            key={r.value}
            style={[
              styles.chip,
              radiusMeters === r.value && styles.chipActive,
            ]}
            onPress={() => setRadiusMeters(r.value)}
          >
            <Text
              style={[
                styles.chipText,
                radiusMeters === r.value && styles.chipTextActive,
              ]}
            >
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={styles.submitText}>
          {loading ? 'SUBMITTING...' : 'SUBMIT REPORT'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontFamily: Fonts.groteskBold,
    fontSize: 7.5,
    letterSpacing: 2.1,
    color: Colors.textTertiary,
    marginBottom: 10,
    marginTop: 20,
    fontWeight: 'normal',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    backgroundColor: Colors.bgCard,
  },
  chipActive: {
    backgroundColor: Colors.bgCTA,
    borderColor: Colors.borderGoldStrong,
  },
  chipText: {
    fontFamily: Fonts.grotesk,
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: 'normal',
  },
  chipTextActive: {
    color: Colors.gold,
  },
  segmented: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
  },
  segmentText: {
    fontFamily: Fonts.groteskBold,
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.textSecondary,
    fontWeight: 'normal',
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.grotesk,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: 'normal',
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 4,
    fontWeight: 'normal',
  },
  submitButton: {
    backgroundColor: Colors.bgCTA,
    borderWidth: 1,
    borderColor: Colors.borderGoldStrong,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontFamily: Fonts.groteskBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.gold,
    fontWeight: 'normal',
  },
  photoPicker: {
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  photoPlaceholder: {
    height: 100,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: 'normal',
  },
  removePhoto: {
    fontFamily: Fonts.grotesk,
    fontSize: 11,
    color: Colors.severityCritical,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'normal',
  },
});
