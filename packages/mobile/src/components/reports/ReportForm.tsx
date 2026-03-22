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
  CATEGORY_COLORS,
  SEVERITY_COLORS,
  UVA_NAVY,
  UVA_ORANGE,
} from '../../lib/constants';

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

export default function ReportForm({ onSubmit, loading }: Props) {
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(500);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const canSubmit = category && title.trim().length > 0 && !loading;

  const [imageBase64, setImageBase64] = useState<string | null>(null);

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
      <Text style={styles.sectionLabel}>Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.chip,
              category === c && {
                backgroundColor: CATEGORY_COLORS[c],
                borderColor: CATEGORY_COLORS[c],
              },
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

      <Text style={styles.sectionLabel}>Severity</Text>
      <View style={styles.segmented}>
        {SEVERITIES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.segment,
              severity === s && {
                backgroundColor: SEVERITY_COLORS[s],
              },
            ]}
            onPress={() => setSeverity(s)}
          >
            <Text
              style={[
                styles.segmentText,
                severity === s && styles.segmentTextActive,
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="What's happening? (max 80 chars)"
        placeholderTextColor="#999"
        value={title}
        onChangeText={(t) => setTitle(t.slice(0, 80))}
        maxLength={80}
      />
      <Text style={styles.charCount}>{title.length}/80</Text>

      <Text style={styles.sectionLabel}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Additional details... (max 300 chars)"
        placeholderTextColor="#999"
        value={description}
        onChangeText={(t) => setDescription(t.slice(0, 300))}
        maxLength={300}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>{description.length}/300</Text>

      <Text style={styles.sectionLabel}>Photo (optional)</Text>
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

      <Text style={styles.sectionLabel}>Radius</Text>
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
          {loading ? 'Submitting...' : 'Submit Report'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: UVA_NAVY,
    marginBottom: 10,
    marginTop: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: UVA_ORANGE,
    borderColor: UVA_ORANGE,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  segmented: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: UVA_ORANGE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  photoPicker: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  photoPlaceholder: {
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  removePhoto: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});
