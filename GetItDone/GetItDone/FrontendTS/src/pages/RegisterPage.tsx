import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  CreditCard,
  Wallet,
  Calendar,
  MapPin,
  Briefcase,
  UserCircle,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

type FormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "CLIENT" | "WORKER";
  aadhaarNo: string;
  panNo: string;
  upiId: string;
  dob: string;
  address: string;
  jobTitle: string;
  profileImage: File | null;
  idDocumentImage: File | null;
};

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "CLIENT",
    aadhaarNo: "",
    panNo: "",
    upiId: "",
    dob: "",
    address: "",
    jobTitle: "",
    profileImage: null,
    idDocumentImage: null,
  });
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState<string | null>(
    null,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};

    // Required fields
    if (!form.fullName.trim()) e.fullName = "Name is required";
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email))
      e.email = "Invalid email";
    if (!/^\d{10}$/.test(form.phoneNumber)) e.phoneNumber = "Must be 10 digits";
    if (form.password.length < 6) e.password = "Min 6 characters";

    // Mandatory: UPI ID
    if (!form.upiId.trim()) e.upiId = "UPI ID is required";

    // Mandatory: Date of Birth
    if (!form.dob) e.dob = "Date of Birth is required";
    if (form.dob && new Date(form.dob) > new Date()) e.dob = "Invalid date";

    // Mandatory: Aadhaar OR PAN (at least one)
    const hasAadhaar = form.aadhaarNo.trim().length > 0;
    const hasPan = form.panNo.trim().length > 0;
    if (!hasAadhaar && !hasPan) {
      e.aadhaarNo = "Either Aadhaar or PAN is required";
      e.panNo = "Either Aadhaar or PAN is required";
    }

    // Validate Aadhaar format if provided
    if (form.aadhaarNo && !/^\d{12}$/.test(form.aadhaarNo))
      e.aadhaarNo = "Must be 12 digits";

    // Validate PAN format if provided
    if (form.panNo && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNo))
      e.panNo = "Invalid PAN format";

    // Mandatory: Profile Image (self photo)
    if (!form.profileImage) e.profileImage = "Profile photo is required";

    // Mandatory: ID Document Image (Aadhaar/PAN)
    if (!form.idDocumentImage)
      e.idDocumentImage = "Aadhaar/PAN card photo is required";

    // Worker-specific validation
    if (form.role === "WORKER" && !form.jobTitle.trim())
      e.jobTitle = "Job title is required for workers";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange =
    (k: keyof Omit<FormState, "profileImage" | "idDocumentImage">) =>
    (
      ev: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm({ ...form, [k]: ev.target.value });
      if (errors[k]) setErrors({ ...errors, [k]: undefined });
    };

  const onProfileImageChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setForm({ ...form, profileImage: file });
      setErrors({ ...errors, profileImage: undefined });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setForm({ ...form, profileImage: null });
    setProfilePreview(null);
  };

  const onIdDocumentChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setForm({ ...form, idDocumentImage: file });
      setErrors({ ...errors, idDocumentImage: undefined });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdDocumentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIdDocumentImage = () => {
    setForm({ ...form, idDocumentImage: null });
    setIdDocumentPreview(null);
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("phoneNumber", form.phoneNumber);
      formData.append("role", form.role);
      formData.append("upiId", form.upiId);
      formData.append("dob", form.dob);

      // Add optional fields if provided
      if (form.aadhaarNo) formData.append("aadhaarNo", form.aadhaarNo);
      if (form.panNo) formData.append("panNo", form.panNo);
      if (form.address) formData.append("address", form.address);
      if (form.role === "WORKER" && form.jobTitle)
        formData.append("jobTitle", form.jobTitle);

      // Append mandatory file uploads
      if (form.profileImage) formData.append("profileImage", form.profileImage);
      if (form.idDocumentImage)
        formData.append("idDocumentImage", form.idDocumentImage);

      const response = await auth.register(formData);
      const message =
        (response as any)?.message || "User registered successfully!";
      toast.success("🎉 " + message);

      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      // Handle error properly - extract message from response
      let errorMessage = "Registration failed";
      if (err?.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo/Brand */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-secondary rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">G</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-2">
            Create Account
          </h1>
          <p className="text-[#475569] text-lg">
            Join GetItDone and start connecting
          </p>
        </motion.div>

        {/* Register Form */}
        <motion.form
          onSubmit={onSubmit}
          className="card shadow-2xl border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="form-label">I am a</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserCircle className="text-gray-400" size={20} />
                </div>
                <select
                  className="input-field pl-12"
                  value={form.role}
                  onChange={onChange("role")}
                >
                  <option value="CLIENT">Client (Hire Workers)</option>
                  <option value="WORKER">Worker (Provide Services)</option>
                </select>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  className={`input-field pl-12 ${errors.fullName ? "border-red-500 focus:ring-red-500" : ""}`}
                  value={form.fullName}
                  onChange={onChange("fullName")}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="error-message">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  className={`input-field pl-12 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                  value={form.email}
                  onChange={onChange("email")}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="form-label">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="text-gray-400" size={20} />
                </div>
                <input
                  inputMode="numeric"
                  pattern="\d*"
                  className={`input-field pl-12 ${errors.phoneNumber ? "border-red-500 focus:ring-red-500" : ""}`}
                  value={form.phoneNumber}
                  onChange={onChange("phoneNumber")}
                  placeholder="10-digit mobile number"
                />
              </div>
              {errors.phoneNumber && (
                <p className="error-message">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type="password"
                  className={`input-field pl-12 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                  value={form.password}
                  onChange={onChange("password")}
                  placeholder="Min 6 characters"
                />
              </div>
              {errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
            </div>

            {/* Job Title - Only for Workers */}
            {form.role === "WORKER" && (
              <div>
                <label className="form-label">Job Title / Profession</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase className="text-gray-400" size={20} />
                  </div>
                  <input
                    className={`input-field pl-12 ${errors.jobTitle ? "border-red-500 focus:ring-red-500" : ""}`}
                    value={form.jobTitle}
                    onChange={onChange("jobTitle")}
                    placeholder="e.g., Plumber, Electrician, Developer"
                  />
                </div>
                {errors.jobTitle && (
                  <p className="error-message">{errors.jobTitle}</p>
                )}
              </div>
            )}

            {/* Aadhaar Number */}
            <div>
              <label className="form-label">
                Aadhaar Number*{" "}
                <span className="text-xs text-gray-500">
                  (required if no PAN)
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CreditCard className="text-gray-400" size={20} />
                </div>
                <input
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={12}
                  className={`input-field pl-12 ${errors.aadhaarNo ? "border-red-500 focus:ring-red-500" : ""}`}
                  value={form.aadhaarNo}
                  onChange={onChange("aadhaarNo")}
                  placeholder="12-digit Aadhaar number"
                />
              </div>
              {errors.aadhaarNo && (
                <p className="error-message">{errors.aadhaarNo}</p>
              )}
            </div>

            {/* PAN Number */}
            <div>
              <label className="form-label">
                PAN Number*{" "}
                <span className="text-xs text-gray-500">
                  (required if no Aadhaar)
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CreditCard className="text-gray-400" size={20} />
                </div>
                <input
                  maxLength={10}
                  className={`input-field pl-12 uppercase ${errors.panNo ? "border-red-500 focus:ring-red-500" : ""}`}
                  value={form.panNo}
                  onChange={onChange("panNo")}
                  placeholder="ABCDE1234F"
                  style={{ textTransform: "uppercase" }}
                />
              </div>
              {errors.panNo && <p className="error-message">{errors.panNo}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Format: 5 letters + 4 digits + 1 letter
              </p>
            </div>

            {/* Profile Image Upload */}
            <div>
              <label className="form-label">Upload Your Profile Photo*</label>
              {!profilePreview ? (
                <label
                  className={`cursor-pointer block border-2 border-dashed rounded-xl p-6 text-center transition-all hover:border-blue-500 hover:bg-blue-50 ${errors.profileImage ? "border-red-500" : "border-gray-300"}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onProfileImageChange}
                    className="hidden"
                  />
                  <UserCircle
                    className="mx-auto text-gray-400 mb-2"
                    size={32}
                  />
                  <p className="text-gray-600 font-medium">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </label>
              ) : (
                <div className="relative border-2 border-gray-200 rounded-xl p-3">
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                  >
                    <X size={16} />
                  </button>
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                    className="w-full h-48 object-contain rounded-lg"
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {form.profileImage?.name}
                  </p>
                </div>
              )}
              {errors.profileImage && (
                <p className="error-message">{errors.profileImage}</p>
              )}
            </div>

            {/* ID Document Upload */}
            <div>
              <label className="form-label">
                Upload Aadhaar/PAN Card Photo*
              </label>
              {!idDocumentPreview ? (
                <label
                  className={`cursor-pointer block border-2 border-dashed rounded-xl p-6 text-center transition-all hover:border-blue-500 hover:bg-blue-50 ${errors.idDocumentImage ? "border-red-500" : "border-gray-300"}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onIdDocumentChange}
                    className="hidden"
                  />
                  <CreditCard
                    className="mx-auto text-gray-400 mb-2"
                    size={32}
                  />
                  <p className="text-gray-600 font-medium">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </label>
              ) : (
                <div className="relative border-2 border-gray-200 rounded-xl p-3">
                  <button
                    type="button"
                    onClick={removeIdDocumentImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                  >
                    <X size={16} />
                  </button>
                  <img
                    src={idDocumentPreview}
                    alt="ID Document preview"
                    className="w-full h-48 object-contain rounded-lg"
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {form.idDocumentImage?.name}
                  </p>
                </div>
              )}
              {errors.idDocumentImage && (
                <p className="error-message">{errors.idDocumentImage}</p>
              )}
            </div>

            {/* UPI ID - Mandatory */}
            <div>
              <label className="form-label">UPI ID*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Wallet className="text-gray-400" size={20} />
                </div>
                <input
                  className={`input-field pl-12 ${errors.upiId ? "border-red-500 focus:ring-red-500" : ""}`}
                  value={form.upiId}
                  onChange={onChange("upiId")}
                  placeholder="your@upi"
                />
              </div>
              {errors.upiId && <p className="error-message">{errors.upiId}</p>}
            </div>

            {/* Date of Birth - Mandatory */}
            <div>
              <label className="form-label">
                Date of Birth*{" "}
                <span className="text-gray-400 text-xs font-normal">
                  (DD/MM/YYYY)
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="text-gray-400" size={20} />
                </div>
                <input
                  type="date"
                  className={`input-field pl-12 ${errors.dob ? "border-red-500 focus:ring-red-500" : ""}`}
                  value={form.dob}
                  onChange={onChange("dob")}
                  placeholder="dd/mm/yyyy"
                  pattern="\d{4}-\d{2}-\d{2}"
                />
              </div>
              {errors.dob && <p className="error-message">{errors.dob}</p>}
            </div>

            {/* Address - Optional */}
            <div>
              <label className="form-label">
                Address{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                  <MapPin className="text-gray-400" size={20} />
                </div>
                <textarea
                  className="input-field pl-12 min-h-[80px]"
                  value={form.address}
                  onChange={onChange("address")}
                  placeholder="Your address"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            disabled={loading}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          {/* Login Link */}
          <p className="text-center text-sm text-[#475569] mt-6">
            Already have an account?{" "}
            <Link
              className="text-[#2563eb] font-semibold hover:text-[#1d4ed8] transition-colors"
              to="/login"
            >
              Sign In
            </Link>
          </p>
        </motion.form>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-[#475569] mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </motion.p>
      </motion.div>
    </div>
  );
}
