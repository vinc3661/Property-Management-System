
import { useEffect, useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";

import { LandlordDashboard } from "./components/dashboard/LandlordDashboard";
import { AuthCard } from "./components/AuthCard";
import { UserProfileForm } from "./components/UserProfileForm";
import { LandlordApplicationFlow } from "./components/Landlord-registration/LandlordApplicationFlow";
import { AdminDashboard } from "./components/AdminDashboard";

import type { Tenant } from "./types/Tenant";
import type { Property } from "./types/Property";
import type { Payment } from "./types/Payment";
import type { UserProfile } from "./types/UserProfile";
import { AcceptanceCode } from "./components/acceptanceCode";
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
  recordPayment,
  subscribeToPayments,
  updatePaymentStatus,
} from "./services/firebase";

import {
  registerUser,
  signUser,
  SubscribeToAuthState,
  signInWithGoogle,
  signOutAccount,
} from "./services/auth";

type RegisterData = {
  email: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

function App() {
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfileState] =
    useState<UserProfile | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  const isAdmin = user?.uid === import.meta.env.VITE_ADMIN_UID;
const invitationToken =
  window.location.pathname.match(/^\/invite\/([^/]+)\/?$/)?.[1] ?? null;
  
  const landlordId =
    userProfile?.role === "landlord"
      ? userProfile.id
      : userProfile?.role === "caretaker"
        ? userProfile.landlordId
        : null;

  
  useEffect(() => {
    if (!landlordId) {
      setTenants([]);
      return;
    }

    const unsubscribe = subscribeToTenants(
      landlordId,
      (tenantData) => {
        setTenants(tenantData);
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
        setProperties(propertyData);
      }
    );

    return unsubscribe;
  }, [landlordId]);

  
  useEffect(() => {
    if (!landlordId) {
      setPayments([]);
      return;
    }

    const unsubscribe = subscribeToPayments(
      landlordId,
      (paymentData) => {
        setPayments(paymentData);
      }
    );

    return unsubscribe;
  }, [landlordId]);

  
  useEffect(() => {
    const unsubscribe = SubscribeToAuthState(async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(true);
      setUserProfileState(null);

      if (!firebaseUser) {
        setAuthLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfileState(profile);
      } catch (error) {
        console.error("Failed to load user profile:", error);
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
      throw error;
    }
  };

  const handleSignUser = async (data: LoginData) => {
    try {
      await signUser(data.email, data.password);
    } catch (error) {
      console.error("Failed to sign in:", error);
      throw error;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      console.log("User signed in with Google.");
    } catch (error) {
      console.error("Google sign-in failed:", error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutAccount();
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  };

  
  const handleSaveUserProfile = async (
    data: Pick<UserProfile, "email" | "name">
  ) => {
    if (!user) {
      throw new Error("Cannot save profile: no authenticated user.");
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
      throw error;
    } finally {
      setProfileSaving(false);
    }
  };


  const handleAddTenant = async (
    tenantData: Omit<Tenant, "id" | "landlordId">
  ) => {
    if (!landlordId) {
      throw new Error("Cannot add tenant: landlord ID is missing.");
    }

    try {
      await addTenantToCloud(landlordId, tenantData);
    } catch (error) {
      console.error("Failed to add tenant:", error);
      throw error;
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!landlordId) {
      throw new Error("Cannot delete tenant: landlord ID is missing.");
    }

    try {
      await deleteTenantFromCloud(tenantId);
    } catch (error) {
      console.error("Failed to delete tenant:", error);
      throw error;
    }
  };

  const handleUpdateTenant = async (
    id: string,
    updates: Partial<Omit<Tenant, "id" | "landlordId">>
  ) => {
    if (!landlordId) {
      throw new Error("Cannot update tenant: landlord ID is missing.");
    }

    try {
      await updateTenantsInCloud(id, updates);
    } catch (error) {
      console.error("Failed to update tenant:", error);
      throw error;
    }
  };

  
  const handleAddProperty = async (
    property: Omit<Property, "id" | "landlordId">
  ) => {
    if (!landlordId) {
      throw new Error("Cannot add property: landlord ID is missing.");
    }

    try {
      await addPropertiesToCloud(landlordId, property);
    } catch (error) {
      console.error("Failed to add property:", error);
      throw error;
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!landlordId) {
      throw new Error("Cannot delete property: landlord ID is missing.");
    }

    try {
      await deletePropertyFromCloud(propertyId);
    } catch (error) {
      console.error("Failed to delete property:", error);
      throw error;
    }
  };

  const handleUpdateProperty = async (
    id: string,
    updates: Partial<Omit<Property, "id" | "landlordId">>
  ) => {
    if (!landlordId) {
      throw new Error("Cannot update property: landlord ID is missing.");
    }

    try {
      await updatePropertiesInCloud(id, updates);
    } catch (error) {
      console.error("Failed to update property:", error);
      throw error;
    }
  };

  
  const handleRecordPayment = async (
    paymentData: Omit<Payment, "id" | "landlordId" | "createdAt">
  ) => {
    if (!landlordId) {
      throw new Error("Cannot record payment: landlord ID is missing.");
    }

    try {
      await recordPayment(landlordId, paymentData);
      console.log("Payment recorded successfully.");
    } catch (error) {
      console.error("Failed to record payment:", error);
      throw error;
    }
  };

  const handleUpdatePaymentStatus = async (
    paymentId: string,
    status: Payment["status"]
  ) => {
    if (!landlordId) {
      throw new Error("Cannot update payment: landlord ID is missing.");
    }

    try {
      await updatePaymentStatus(paymentId, status);
      console.log("Payment status updated successfully.");
    } catch (error) {
      console.error("Failed to update payment status:", error);
      throw error;
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
    return <AdminDashboard />;
  }

  
  if (!userProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold">
            Complete your profile
          </h1>

          <p className="mb-6 text-gray-600">
            Enter your name and email to finish setting up your account.
          </p>

          <UserProfileForm
            onRegisterUserProfile={handleSaveUserProfile}
            initialEmail={user.email ?? ""}
            initialName={user.displayName ?? ""}
          />

          {profileSaving && (
            <p className="mt-4 text-sm text-gray-500">
              Saving your profile...
            </p>
          )}
        </section>
      </main>
    );
  }

  if (invitationToken) {
  return (
    <AcceptanceCode invitationToken={invitationToken} />
  );
}
  if (userProfile.role === "landlord") {
    return (
      <LandlordDashboard
        properties={properties}
        tenants={tenants}
        payments={payments}
        userName={userProfile.name}
        onSignOut={handleSignOut}
        onAddTenant={handleAddTenant}
        onDeleteTenant={handleDeleteTenant}
        onUpdateTenant={handleUpdateTenant}
        onAddProperty={handleAddProperty}
        onDeleteProperty={handleDeleteProperty}
        onUpdateProperty={handleUpdateProperty}
        onRecordPayment={handleRecordPayment}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
      />
    );
  }

  
  if (userProfile.role === "caretaker") {
    if (!userProfile.landlordId) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
          <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900">
              Awaiting workspace access
            </h1>

            <p className="mt-3 text-gray-600">
              Your caretaker account has not yet been connected to a landlord.
            </p>

            <button
              onClick={handleSignOut}
              className="mt-6 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
            >
              Sign out
            </button>
          </section>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <section className="max-w-md rounded-xl bg-white p-8 text-center shadow">
          <h1 className="text-xl font-bold">
            Caretaker dashboard coming next
          </h1>

          <p className="mt-2 text-gray-600">
            Your workspace is connected. We're setting up your dashboard.
          </p>

          <button
            onClick={handleSignOut}
            className="mt-5 rounded-lg bg-red-600 px-5 py-2 text-white"
          >
            Sign out
          </button>
        </section>
      </main>
    );
  }

  
  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome, {userProfile.name}
          </h1>

          <p className="mt-2 text-gray-600">
            {userProfile.email}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Role: Awaiting approval
          </p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-2 text-2xl font-bold">
            Apply for landlord access
          </h2>

          <p className="mb-6 text-gray-600">
            Submit your property details and ownership document for review.
          </p>

          <LandlordApplicationFlow />
        </section>

        <button
          onClick={handleSignOut}
          className="mt-6 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}

export default App;
