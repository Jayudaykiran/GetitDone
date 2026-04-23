-- Fix: Insert worker profile for user with email kal@gmail.com
-- This user registered as WORKER but didn't complete the worker profile setup

INSERT INTO workers (
    id, 
    user_id, 
    subtype, 
    job_role, 
    years_experience, 
    bio, 
    work_type, 
    coverage_radius_km, 
    pricing_type, 
    rate, 
    payment_upi, 
    payment_bank_acc, 
    payment_ifsc, 
    availability, 
    verified,
    skills,
    work_categories,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),  -- Generate new UUID for worker profile
    id AS user_id,      -- Link to user
    'Everyday' AS subtype,  -- Can be 'Professional' or 'Everyday'
    job_title AS job_role,  -- Copy job_title from users table to job_role in workers table
    0 AS years_experience,  -- Default 0 years
    'Experienced ' || job_title AS bio,  -- Simple bio
    'Offline' AS work_type,  -- Online, Offline, or Both
    10 AS coverage_radius_km,  -- 10 km radius
    'PER_HOUR' AS pricing_type,  -- PER_HOUR, PER_DAY, or PER_PROJECT
    500 AS rate,  -- Default rate
    upi_id AS payment_upi,
    NULL AS payment_bank_acc,
    NULL AS payment_ifsc,
    true AS availability,  -- Available for work
    false AS verified,  -- Not verified yet
    '[]'::jsonb AS skills,  -- Empty skills array
    '[]'::jsonb AS work_categories,  -- Empty categories array
    now() AS created_at,
    now() AS updated_at
FROM users 
WHERE email = 'kal@gmail.com' 
AND role = 'WORKER'
AND NOT EXISTS (
    SELECT 1 FROM workers WHERE user_id = users.id
);

-- Verify the insertion
SELECT 
    w.id AS worker_id,
    w.job_role,
    w.subtype,
    w.availability,
    u.full_name,
    u.email,
    u.unique_user_code
FROM workers w 
JOIN users u ON w.user_id = u.id
WHERE u.email = 'kal@gmail.com';
