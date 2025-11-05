    -- Diagnostic query to check if the fix is working
    -- Run this in Supabase SQL Editor

    -- 1. Check if columns exist
    SELECT 
        'Column Check' as check_type,
        column_name,
        data_type,
        is_nullable,
        column_default
    FROM information_schema.columns 
    WHERE table_name = 'projects'
    AND column_name IN ('estimated_credits', 'credit_price')
    ORDER BY column_name;

    -- 2. Check RECENT projects (last 24 hours) with pricing data
    SELECT 
        'Recent Projects' as check_type,
        id,
        title,
        status,
        estimated_credits,
        credit_price,
        created_at
    FROM projects
    WHERE created_at > NOW() - INTERVAL '24 hours'
    ORDER BY created_at DESC;

    -- 3. Check if project_credits use custom prices
    SELECT 
        'Project Credits' as check_type,
        pc.id,
        pc.price_per_credit,
        pc.currency,
        p.title,
        p.credit_price as project_credit_price,
        CASE 
            WHEN pc.price_per_credit = p.credit_price THEN '✅ Custom price used'
            WHEN p.credit_price IS NULL THEN '❌ Project has NULL price'
            ELSE '❌ Price mismatch'
        END as status
    FROM project_credits pc
    LEFT JOIN projects p ON p.id = pc.project_id
    ORDER BY pc.created_at DESC
    LIMIT 10;

    -- 4. Summary
    SELECT 
        'Summary' as check_type,
        COUNT(*) FILTER (WHERE estimated_credits IS NOT NULL) as projects_with_credits,
        COUNT(*) FILTER (WHERE credit_price IS NOT NULL) as projects_with_price,
        COUNT(*) as total_projects
    FROM projects
    WHERE status = 'approved';








