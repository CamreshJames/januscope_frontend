import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { FormEngine } from '../../components/form-engine/FormEngine';
import type { FormSchema } from '../../components/form-engine/types';
import { useToast } from '../../contexts/ToastContext';
import { usersService, authService } from '../../services/januscope.service';
import type { User } from '../../types/januscope.types';
import { ImageUpload } from '../../components/ImageUpload/ImageUpload';

const editProfileSchema: FormSchema = {
  id: 'edit-profile-form',
  meta: {
    title: '',
  },
  fields: {
    firstName: {
      id: 'firstName',
      renderer: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      rules: {
        required: 'First name is required',
        minLength: { value: 2, message: 'First name must be at least 2 characters' },
      },
    },
    middleName: {
      id: 'middleName',
      renderer: 'text',
      label: 'Middle Name',
      placeholder: 'Optional',
    },
    lastName: {
      id: 'lastName',
      renderer: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      rules: {
        required: 'Last name is required',
        minLength: { value: 2, message: 'Last name must be at least 2 characters' },
      },
    },
    email: {
      id: 'email',
      renderer: 'text',
      label: 'Email',
      placeholder: 'your@email.com',
      inputType: 'email',
      rules: {
        required: 'Email is required',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email address',
        },
      },
    },
    phoneNumber: {
      id: 'phoneNumber',
      renderer: 'text',
      label: 'Phone Number',
      placeholder: '+254712345678',
      inputType: 'tel',
    },
    nationalId: {
      id: 'nationalId',
      renderer: 'text',
      label: 'National ID',
      placeholder: 'Enter your national ID',
    },
    dateOfBirth: {
      id: 'dateOfBirth',
      renderer: 'text',
      label: 'Date of Birth',
      placeholder: 'YYYY-MM-DD',
    },
    gender: {
      id: 'gender',
      renderer: 'select',
      label: 'Gender',
      placeholder: 'Select Gender',
      props: {
        data: [
          { value: '', label: 'Select Gender' },
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ],
      },
    },
    branchId: {
      id: 'branchId',
      renderer: 'select',
      label: 'Branch',
      placeholder: 'Select Branch',
      props: {
        data: [], // Will be populated dynamically
      },
    },
  },
  layout: [
    {
      kind: 'grid',
      cols: 3,
      children: [
        { kind: 'field', fieldId: 'firstName' },
        { kind: 'field', fieldId: 'middleName' },
        { kind: 'field', fieldId: 'lastName' },
      ],
    },
    {
      kind: 'grid',
      cols: 2,
      children: [
        { kind: 'field', fieldId: 'email' },
        { kind: 'field', fieldId: 'phoneNumber' },
      ],
    },
    {
      kind: 'grid',
      cols: 3,
      children: [
        { kind: 'field', fieldId: 'nationalId' },
        { kind: 'field', fieldId: 'dateOfBirth' },
        { kind: 'field', fieldId: 'gender' },
      ],
    },
    { kind: 'field', fieldId: 'branchId' },
  ],
};

function EditProfile() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<string>('');
  const [branches, setBranches] = useState<Array<{ value: number; label: string }>>([]);

  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user
        const userResponse = await authService.getMe(token);
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
          setProfileImage(userResponse.data.profileImageUrl || '');
        }

        // Load branches
        try {
          const branchesResponse = await fetch('/api/v1/branches', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (branchesResponse.ok) {
            const branchesData = await branchesResponse.json();
            if (branchesData.success && branchesData.data) {
              setBranches([
                { value: 0, label: 'No Branch' },
                ...branchesData.data.map((b: any) => ({
                  value: b.branchId || b.id,
                  label: b.name
                }))
              ]);
            }
          }
        } catch (err) {
          console.error('Failed to load branches:', err);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (values: any) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await usersService.update(
        user.userId || user.id,
        {
          profileImageUrl: profileImage || undefined,
          firstName: values.firstName,
          middleName: values.middleName || undefined,
          lastName: values.lastName,
          email: values.email,
          phoneNumber: values.phoneNumber || undefined,
          nationalId: values.nationalId || undefined,
          dateOfBirth: values.dateOfBirth || undefined,
          gender: values.gender || undefined,
          branchId: values.branchId && values.branchId !== 0 ? values.branchId : undefined,
        },
        token
      );

      if (response.success) {
        success('Profile updated successfully');
        navigate({ to: '/profile' });
      } else {
        // Show detailed error message from backend
        // Backend returns specific errors in the 'error' field
        const errorMsg = response.error || response.message || 'Failed to update profile';
        showError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update profile';
      showError(errorMsg);
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <>
      {/* Back Button */}
      <div style={{ marginBottom: '16px' }}>
        <a href="/profile" className="btn btn-ghost" style={{ padding: '8px 12px' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Profile
        </a>
      </div>

      <div className="profile-section-header">
        <h2 className="profile-section-title">Edit Profile</h2>
      </div>

      <ImageUpload
        currentImage={profileImage}
        onImageChange={setProfileImage}
        label="Profile Picture"
      />

      <FormEngine
        schema={{
          ...editProfileSchema,
          fields: {
            ...editProfileSchema.fields,
            branchId: {
              ...editProfileSchema.fields.branchId,
              props: {
                data: branches,
              },
            },
          },
        }}
        initialValues={{
          firstName: user.firstName || '',
          middleName: user.middleName || '',
          lastName: user.lastName || '',
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          nationalId: user.nationalId || '',
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
          gender: user.gender || '',
          branchId: user.branchId || 0,
        }}
        onSubmit={handleSubmit}
        primaryColor="#ff6b35"
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="loading-spinner" />
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Updating...</p>
        </div>
      )}
    </>
  );
}

export const Route = createFileRoute('/profile/edit')({
  component: EditProfile,
});
