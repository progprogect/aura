SELECT 
  sp.slug,
  sp.verified,
  sp."acceptingClients" as accepting_clients,
  sp.category,
  LENGTH(sp.about) as about_length,
  sp.city,
  u."firstName" as first_name,
  u."lastName" as last_name,
  CASE 
    WHEN sp."acceptingClients" = false THEN '❌ НЕ ПРИНИМАЕТ КЛИЕНТОВ'
    WHEN sp.verified = false THEN '❌ НЕ ВЕРИФИЦИРОВАН'
    WHEN sp.about IS NULL OR sp.about = '' THEN '❌ НЕТ ОПИСАНИЯ'
    ELSE '✅ ВСЕ ОК'
  END as status
FROM "SpecialistProfile" sp
JOIN "User" u ON sp."userId" = u.id
WHERE sp.slug = 'nikita-test';
