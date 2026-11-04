
import { useEffect, useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";

import type { Tenant } from "./types/Tenant";
import type { Property } from "./types/Property";
import type { UserProfile } from "./types/UserProfile";

import { TenantForm } from "./components/TenantForm";
import { TenantCard } from "./components/Tenantcard";
import { PropertyForm } from "./components/PropertyForm";
import { PropertyCard } from "./components/PropertyCard";
import { AuthCard } from "./components/AuthCard";
import { UserProfileForm } from "./components/UserProfileForm";
import { LandlordApplicationFlow } from "./components/Landlord-registration/LandlordApplicationFlow";

import { getAdminApplications } from "./services/admin";

import {
  addTenantToCloud,
  subscribeToTenants,
  deleteTenantFromCloud,
  updateTenantsInCloud,
  addPropertiesToCloud,
  subscribeToProperties,
  deletePropertyFromCloud,
  updatePropertiesInCloud,
  getUserProfile,
  setUserProfile as saveProfileToFirestore,
} from "./services/firebase";

import {
  registerUser,
  signUser,
  SubscribeToAuthState,
  signInWithGoogle,
} from "./services/auth";
import { AdminDashboard } from "./components/AdminDashboard";

type RegisterData = {
  email: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

async function testAdminAccess() {
  try {
    const result = await getAdminApplications();

    console.log("Admin access successful");
    console.log("Applications found:", result.applications.length);
  } catch (error) {
    console.error("Admin access failed:", error);
  }
}

function App() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfileState] =
    useState<UserProfile | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState(false);

  const landlordId =
    userProfile?.role === "landlord"
      ? userProfile.id
      : userProfile?.role === "caretaker"
        ? userProfile.landlordId
        : null;

        const isAdmin=
        Boolean(import.meta.env.VITE_ADMIN_UID)&&
        user?.uid===import.meta.env.VITE_ADMIN_UID;
console.log("ADMIN EMAIL:", user?.email);
console.log("FIREBASE UID:", user?.uid);
console.log("ENV ADMIN UID:", import.meta.env.VITE_ADMIN_UID);
console.log(
  "IS ADMIN:",
  user?.uid === import.meta.env.VITE_ADMIN_UID
);
  useEffect(() => {
    if (!landlordId) {
      setTenants([]);
      return;
    }

    const unsubscribe = subscribeToTenants(
      landlordId,
      (tenantData) => {
        if (tenantData) {
          setTenants(tenantData);
        }
      }
    );

    return unsubscribe;
  }, [landlordId]);

  
  useEffect(() => {
    if (!landlordId) {
      setProperties([]);
      return;
    }

    const unsubscribe = subscribeToProperties(
      landlordId,
      (propertyData) => {
        if (propertyData) {
          setProperties(propertyData);
        }
      }
    );

    return unsubscribe;
  }, [landlordId]);

  
  useEffect(() => {
    const unsubscribe = SubscribeToAuthState(async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(true);
      setUserProfileState(null);
      setProfileLoadError(false);

      try {
        if (firebaseUser) {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfileState(profile);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setProfileLoadError(true);
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleRegisterUser = async (data: RegisterData) => {
    try {
      await registerUser(data.email, data.password);
    } catch (error) {
      console.error("Failed to register account:", error);
    }
  };

  const handleSignUser = async (data: LoginData) => {
    try {
      await signUser(data.email, data.password);
    } catch (error) {
      console.error("Failed to sign in:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      console.log("User signed in");
    } catch (error) {
      console.error("Sign in with Google failed:", error);
    }
  };

  
  const handleSaveUserProfile = async (
    data: Pick<UserProfile, "email" | "name">
  ) => {
    if (!user) {
      console.error("Cannot save profile: no authenticated user.");
      return;
    }

    setProfileSaving(true);

    try {
      const profile: UserProfile = {
        id: user.uid,
        email: data.email,
        name: data.name,
        role: null,
        landlordId: null,
        phoneNumber: null,
      };

      await saveProfileToFirestore(user.uid, profile);

      setUserProfileState(profile);

      console.log("User profile saved successfully.");
    } catch (error) {
      console.error("Failed to save user profile:", error);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddTenant = async (
    tenantData: Omit<Tenant, "id" | "landlordId">
  ) => {
    if (!landlordId) {
      console.error("Cannot add tenant: landlord ID is not set.");
      return;
    }

    try {
      await addTenantToCloud(landlordId, tenantData);
    } catch (error) {
      console.error("Failed to add tenant:", error);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      await deleteTenantFromCloud(tenantId);
    } catch (error) {
      console.error("Failed to delete tenant:", error);
    }
  };

  const handleUpdateTenant = async (
    id: string,
    updates: Partial<Omit<Tenant, "id">>
  ) => {
    try {
      await updateTenantsInCloud(id, updates);
    } catch (error) {
      console.error("Failed to update tenant:", error);
    }
  };

  const handleAddProperty = async (
    property: Omit<Property, "id" | "landlordId">
  ) => {
    if (!landlordId) {
      console.error("Cannot add property: landlord ID is not set.");
      return;
    }

    try {
      await addPropertiesToCloud(landlordId, property);
    } catch (error) {
      console.error("Failed to add property:", error);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await deletePropertyFromCloud(propertyId);
    } catch (error) {
      console.error("Failed to delete property:", error);
    }
  };

  const handleUpdateProperty = async (
    id: string,
    updates: Partial<Omit<Property, "id">>
  ) => {
    try {
      await updatePropertiesInCloud(id, updates);
    } catch (error) {
      console.error("Failed to update property:", error);
    }
  };

  
  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Checking your account...</p>
      </main>
    );
  }
  if (!user) {
  return (
    <AuthCard
      onSignUser={handleSignUser}
      onRegister={handleRegisterUser}
      onGoogleSignIn={handleGoogleSignIn}
    />
  );
}

if (isAdmin) {
  return <AdminDashboard/>;
};
  
  if (profileLoadError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-xl font-bold">
          Unable to load your profile
        </h1>

        <p className="text-center text-gray-600">
          Something went wrong while retrieving your account information.
          Please try refreshing the page.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </main>
    );
  }

  
  if (!userProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md">
          <UserProfileForm
            onRegisterUserProfile={handleSaveUserProfile}
            initialEmail={user.email ?? ""}
            initialName={user.displayName ?? ""}
          />

          {profileSaving && (
            <p className="mt-4 text-center text-gray-600">
              Saving your profile...
            </p>
          )}
        </div>
      </main>
    );
  }

  
  if (
    userProfile.role !== "landlord" &&
    userProfile.role !== "caretaker"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="mb-3 text-2xl font-bold">
            Account awaiting approval
          </h1>

          <p className="text-gray-600">
            Your profile has been created successfully.
            However, you need landlord approval before accessing
            the property management workspace.
          </p>

          <div className="mt-6">
            <LandlordApplicationFlow />
          </div>
        </section>
      </main>
    );
  }

  
  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            Property Management System
          </h1>

          <p className="mt-2 text-gray-600">
            Welcome, {userProfile.name}
          </p>

          <p className="text-sm text-gray-500">
            {userProfile.email}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Role: {userProfile.role ?? "Awaiting role assignment"}
          </p>
        </header>


        <section className="mb-8 rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-2 text-2xl font-bold">
            Apply for landlord access
          </h2>

          <p className="mb-6 text-gray-600">
            Submit your property details and ownership document for review.
          </p>

          <LandlordApplicationFlow />
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-2 text-2xl font-bold">
              Tenant Management
            </h2>

            <p className="mb-6 text-gray-600">
              Track tenant registration and payment status.
            </p>

            <TenantForm onAddTenant={handleAddTenant} />

            <div className="mt-6 flex flex-col gap-4">
              {tenants.map((tenant) => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  onDelete={handleDeleteTenant}
                  onUpdate={handleUpdateTenant}
                />
              ))}

              {tenants.length === 0 && (
                <p className="text-gray-500">
                  No tenants registered yet.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-2 text-2xl font-bold">
              Property Management
            </h2>

            <p className="mb-6 text-gray-600">
              Register properties and monitor occupancy.
            </p>

            <PropertyForm onAddProperty={handleAddProperty} />

            <div className="mt-6 flex flex-col gap-4">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onDelete={handleDeleteProperty}
                  onUpdate={handleUpdateProperty}
                />
              ))}

              {properties.length === 0 && (
                <p className="text-gray-500">
                  No properties registered yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
