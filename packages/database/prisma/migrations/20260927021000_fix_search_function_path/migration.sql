-- Pin the search-vector trigger functions to trusted built-in functions.
ALTER FUNCTION public.skill_search_vector_update() SET search_path = pg_catalog;
ALTER FUNCTION public.agent_search_vector_update() SET search_path = pg_catalog;
ALTER FUNCTION public.blogpost_search_vector_update() SET search_path = pg_catalog;
