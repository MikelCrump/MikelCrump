-- Enable Supabase Realtime for instant sync across clients
-- Run after 001_initial_schema.sql

-- Full replica identity so DELETE events include old row data
alter table bases replica identity full;
alter table tf_tables replica identity full;
alter table tf_records replica identity full;
alter table tf_forms replica identity full;
alter table workspace_members replica identity full;

-- Add tables to the Realtime publication
alter publication supabase_realtime add table bases;
alter publication supabase_realtime add table tf_tables;
alter publication supabase_realtime add table tf_records;
alter publication supabase_realtime add table tf_forms;
alter publication supabase_realtime add table workspace_members;

-- Allow authenticated users to receive Realtime broadcasts (RLS still filters rows)
grant usage on schema public to authenticated;
grant select on bases to authenticated;
grant select on tf_tables to authenticated;
grant select on tf_records to authenticated;
grant select on tf_forms to authenticated;
grant select on workspace_members to authenticated;
