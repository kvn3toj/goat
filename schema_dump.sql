

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."playlist_item_type" AS ENUM (
    'video',
    'article',
    'quiz',
    'resource'
);


ALTER TYPE "public"."playlist_item_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."playlist_item_type" IS 'Tipos de items posibles en playlists/folders.';



CREATE OR REPLACE FUNCTION "public"."get_user_role"("user_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  profile_role TEXT;
BEGIN
  SELECT role INTO profile_role FROM public.admin_profiles WHERE id = user_id;
  RETURN profile_role;
END;
$$;


ALTER FUNCTION "public"."get_user_role"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_role"("user_id" "uuid") IS 'Retrieves the role from admin_profiles for a given user ID. SECURITY DEFINER is required to read admin_profiles table.';



CREATE OR REPLACE FUNCTION "public"."swap_playlist_items_order"("p_item1_id" "uuid", "p_item2_id" "uuid", "p_playlist_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_order1 INT;
    v_order2 INT;
    v_item1_exists BOOLEAN;
    v_item2_exists BOOLEAN;
BEGIN
    -- Verificar que ambos items existen y pertenecen a la misma playlist
    SELECT EXISTS (
        SELECT 1 FROM public.playlist_items pi
        WHERE pi.id = p_item1_id AND pi.playlist_id = p_playlist_id
    ) INTO v_item1_exists;

    SELECT EXISTS (
        SELECT 1 FROM public.playlist_items pi
        WHERE pi.id = p_item2_id AND pi.playlist_id = p_playlist_id
    ) INTO v_item2_exists;

    IF NOT v_item1_exists THEN
        RAISE EXCEPTION 'Item 1 (ID: %) no encontrado en la playlist (ID: %)', p_item1_id, p_playlist_id;
    END IF;

    IF NOT v_item2_exists THEN
        RAISE EXCEPTION 'Item 2 (ID: %) no encontrado en la playlist (ID: %)', p_item2_id, p_playlist_id;
    END IF;

    -- Obtener los índices actuales
    SELECT order_index INTO v_order1 FROM public.playlist_items WHERE id = p_item1_id;
    SELECT order_index INTO v_order2 FROM public.playlist_items WHERE id = p_item2_id;

    -- Realizar el intercambio en una transacción implícita
    UPDATE public.playlist_items
    SET order_index = v_order2, updated_at = now()
    WHERE id = p_item1_id;

    UPDATE public.playlist_items
    SET order_index = v_order1, updated_at = now()
    WHERE id = p_item2_id;

    -- Registrar la operación en el log
    RAISE NOTICE 'Intercambio completado: Item % (índice %) ↔ Item % (índice %) en playlist %',
        p_item1_id, v_order1, p_item2_id, v_order2, p_playlist_id;
END;
$$;


ALTER FUNCTION "public"."swap_playlist_items_order"("p_item1_id" "uuid", "p_item2_id" "uuid", "p_playlist_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."swap_playlist_items_order"("p_item1_id" "uuid", "p_item2_id" "uuid", "p_playlist_id" "uuid") IS 'Atomically swaps the order_index of two specified playlist items within the same playlist.';



CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."trigger_set_timestamp"() IS 'Automatically sets the updated_at column to the current UTC timestamp on update.';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "admin_profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))
);


ALTER TABLE "public"."admin_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_profiles" IS 'Perfiles de los usuarios administradores de la herramienta Gamifier_Admin.';



COMMENT ON COLUMN "public"."admin_profiles"."id" IS 'Referencia al ID del usuario en Supabase Auth.';



COMMENT ON COLUMN "public"."admin_profiles"."role" IS 'Rol del usuario (admin, super_admin). Determina permisos.';



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."categories" IS 'Categorías globales para etiquetar y organizar playlist_items.';



COMMENT ON COLUMN "public"."categories"."name" IS 'Nombre único de la categoría.';



CREATE TABLE IF NOT EXISTS "public"."cycle_answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question_cycle_id" "uuid" NOT NULL,
    "answer_text" "text" NOT NULL,
    "is_correct" boolean DEFAULT false NOT NULL,
    "ondas_reward" integer DEFAULT 0 NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE ONLY "public"."cycle_answers" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."cycle_answers" OWNER TO "postgres";


COMMENT ON TABLE "public"."cycle_answers" IS 'Stores possible answers for a specific question cycle.';



COMMENT ON COLUMN "public"."cycle_answers"."question_cycle_id" IS 'The cycle this answer belongs to.';



COMMENT ON COLUMN "public"."cycle_answers"."ondas_reward" IS 'Reward (in Ondas) for selecting this answer.';



COMMENT ON COLUMN "public"."cycle_answers"."order_index" IS 'Order of the answer within its cycle.';



CREATE TABLE IF NOT EXISTS "public"."item_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_id" "uuid" NOT NULL,
    "question_text" "text" NOT NULL,
    "question_type" "text" NOT NULL,
    "display_timestamp" real DEFAULT 0.0 NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "presentation_language" "text" DEFAULT 'es'::"text",
    "show_subtitles" boolean DEFAULT false,
    "show_question" boolean DEFAULT true,
    "randomize_cycles" boolean DEFAULT false,
    "randomize_answers" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "language" character varying(10) DEFAULT 'es'::character varying,
    CONSTRAINT "item_questions_display_timestamp_check" CHECK (("display_timestamp" >= (0)::double precision)),
    CONSTRAINT "item_questions_question_type_check" CHECK (("question_type" = ANY (ARRAY['multiple_choice'::"text", 'true_false'::"text", 'a_b'::"text", 'quiz'::"text"])))
);

ALTER TABLE ONLY "public"."item_questions" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."item_questions" OWNER TO "postgres";


COMMENT ON TABLE "public"."item_questions" IS 'Stores general information and settings for an interactive question.';



COMMENT ON COLUMN "public"."item_questions"."question_text" IS 'The main text content of the question.';



COMMENT ON COLUMN "public"."item_questions"."show_subtitles" IS 'Whether subtitles should be shown during the question.';



COMMENT ON COLUMN "public"."item_questions"."show_question" IS 'Whether the question text itself should be shown.';



COMMENT ON COLUMN "public"."item_questions"."language" IS 'Language code for the question (e.g., es, en).';



CREATE TABLE IF NOT EXISTS "public"."mundos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone
);

ALTER TABLE ONLY "public"."mundos" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."mundos" OWNER TO "postgres";


COMMENT ON TABLE "public"."mundos" IS 'RLS reactivated for Mundos.';



COMMENT ON COLUMN "public"."mundos"."is_active" IS 'Indica si el mundo está visible/activo en Coomünity.';



COMMENT ON COLUMN "public"."mundos"."is_pinned" IS 'Permite destacar o fijar mundos importantes.';



COMMENT ON COLUMN "public"."mundos"."order_index" IS 'Índice para ordenación manual de los mundos.';



COMMENT ON COLUMN "public"."mundos"."created_by" IS 'Admin que creó originalmente este mundo.';



COMMENT ON COLUMN "public"."mundos"."is_deleted" IS 'Flag para borrado lógico (soft delete).';



COMMENT ON COLUMN "public"."mundos"."deleted_at" IS 'Fecha y hora del borrado lógico.';



CREATE TABLE IF NOT EXISTS "public"."playlist_folders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "mundo_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone
);

ALTER TABLE ONLY "public"."playlist_folders" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."playlist_folders" OWNER TO "postgres";


COMMENT ON TABLE "public"."playlist_folders" IS 'RLS reactivated for Playlist Folders.';



COMMENT ON COLUMN "public"."playlist_folders"."mundo_id" IS 'Mundo al que pertenece esta carpeta.';



COMMENT ON COLUMN "public"."playlist_folders"."order_index" IS 'Índice para ordenación manual dentro del mundo.';



CREATE TABLE IF NOT EXISTS "public"."playlist_item_categories" (
    "item_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_by" "uuid" NOT NULL
);


ALTER TABLE "public"."playlist_item_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."playlist_item_categories" IS 'Tabla de unión para la relación N:M entre Items y Categorías.';



COMMENT ON COLUMN "public"."playlist_item_categories"."item_id" IS 'Referencia al Item.';



COMMENT ON COLUMN "public"."playlist_item_categories"."category_id" IS 'Referencia a la Categoría.';



COMMENT ON COLUMN "public"."playlist_item_categories"."created_by" IS 'Admin que asignó esta categoría a este item.';



CREATE TABLE IF NOT EXISTS "public"."playlist_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "playlist_id" "uuid",
    "folder_id" "uuid",
    "item_type" "text" DEFAULT 'video_embed'::"text" NOT NULL,
    "title" "text",
    "description" "text",
    "content" "jsonb" NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "chk_item_parent" CHECK (((("playlist_id" IS NOT NULL) AND ("folder_id" IS NULL)) OR (("playlist_id" IS NULL) AND ("folder_id" IS NOT NULL))))
);

ALTER TABLE ONLY "public"."playlist_items" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."playlist_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."playlist_items" IS 'Unidad de contenido individual (video, artículo, etc.) dentro de una Playlist o Carpeta.';



COMMENT ON COLUMN "public"."playlist_items"."playlist_id" IS 'Playlist a la que pertenece este item (si aplica).';



COMMENT ON COLUMN "public"."playlist_items"."folder_id" IS 'Carpeta a la que pertenece este item (si aplica).';



COMMENT ON COLUMN "public"."playlist_items"."item_type" IS 'Type of content (e.g., video_embed, quiz). Changed to TEXT.';



COMMENT ON COLUMN "public"."playlist_items"."title" IS 'User-defined title for the playlist item.';



COMMENT ON COLUMN "public"."playlist_items"."description" IS 'User-defined description for the playlist item.';



COMMENT ON COLUMN "public"."playlist_items"."content" IS 'Datos específicos del item en formato JSON (URLs, IDs externos, configuración de quiz, etc.).';



COMMENT ON COLUMN "public"."playlist_items"."order_index" IS 'Índice para ordenación manual dentro de su contenedor (Playlist o Carpeta).';



COMMENT ON CONSTRAINT "chk_item_parent" ON "public"."playlist_items" IS 'Garantiza que cada item tenga exactamente un contenedor padre (Playlist o Folder).';



CREATE TABLE IF NOT EXISTS "public"."playlists" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "mundo_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone
);

ALTER TABLE ONLY "public"."playlists" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."playlists" OWNER TO "postgres";


COMMENT ON TABLE "public"."playlists" IS 'RLS reactivated for Playlists.';



COMMENT ON COLUMN "public"."playlists"."mundo_id" IS 'Mundo al que pertenece esta playlist.';



COMMENT ON COLUMN "public"."playlists"."order_index" IS 'Índice para ordenación manual dentro del mundo.';



CREATE TABLE IF NOT EXISTS "public"."question_cycles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_question_id" "uuid" NOT NULL,
    "delay_seconds" integer DEFAULT 0 NOT NULL,
    "duration_seconds" integer DEFAULT 10 NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE ONLY "public"."question_cycles" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_cycles" OWNER TO "postgres";


COMMENT ON TABLE "public"."question_cycles" IS 'Stores cycles (timing, variants) for a specific question.';



COMMENT ON COLUMN "public"."question_cycles"."item_question_id" IS 'The item_question this cycle belongs to.';



COMMENT ON COLUMN "public"."question_cycles"."delay_seconds" IS 'Delay in seconds before the cycle starts.';



COMMENT ON COLUMN "public"."question_cycles"."duration_seconds" IS 'Duration in seconds the cycle is active.';



COMMENT ON COLUMN "public"."question_cycles"."order_index" IS 'Order of the cycle within its question.';



COMMENT ON COLUMN "public"."question_cycles"."is_active" IS 'Whether this cycle is currently enabled.';



ALTER TABLE ONLY "public"."admin_profiles"
    ADD CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cycle_answers"
    ADD CONSTRAINT "cycle_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."item_questions"
    ADD CONSTRAINT "item_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mundos"
    ADD CONSTRAINT "mundos_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "public"."mundos"
    ADD CONSTRAINT "mundos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."playlist_folders"
    ADD CONSTRAINT "playlist_folders_name_in_mundo_unique" UNIQUE ("mundo_id", "name");



ALTER TABLE ONLY "public"."playlist_folders"
    ADD CONSTRAINT "playlist_folders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."playlist_item_categories"
    ADD CONSTRAINT "playlist_item_categories_pkey" PRIMARY KEY ("item_id", "category_id");



ALTER TABLE ONLY "public"."playlist_items"
    ADD CONSTRAINT "playlist_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."playlists"
    ADD CONSTRAINT "playlists_name_in_mundo_unique" UNIQUE ("mundo_id", "name");



ALTER TABLE ONLY "public"."playlists"
    ADD CONSTRAINT "playlists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_cycles"
    ADD CONSTRAINT "question_cycles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_cycle_answers_cycle_id_order" ON "public"."cycle_answers" USING "btree" ("question_cycle_id", "order_index");



CREATE INDEX "idx_item_questions_item_id_order" ON "public"."item_questions" USING "btree" ("item_id", "order_index");



CREATE INDEX "idx_mundos_created_by" ON "public"."mundos" USING "btree" ("created_by");



CREATE INDEX "idx_mundos_is_active" ON "public"."mundos" USING "btree" ("is_active");



CREATE INDEX "idx_playlist_folders_mundo_id" ON "public"."playlist_folders" USING "btree" ("mundo_id");



CREATE INDEX "idx_playlist_item_categories_category_id" ON "public"."playlist_item_categories" USING "btree" ("category_id");



CREATE INDEX "idx_playlist_item_categories_item_id" ON "public"."playlist_item_categories" USING "btree" ("item_id");



CREATE INDEX "idx_playlist_items_folder_id" ON "public"."playlist_items" USING "btree" ("folder_id");



CREATE INDEX "idx_playlist_items_item_type" ON "public"."playlist_items" USING "btree" ("item_type");



CREATE INDEX "idx_playlist_items_playlist_id" ON "public"."playlist_items" USING "btree" ("playlist_id");



CREATE INDEX "idx_playlists_mundo_id" ON "public"."playlists" USING "btree" ("mundo_id");



CREATE INDEX "idx_question_cycles_item_question_id" ON "public"."question_cycles" USING "btree" ("item_question_id", "order_index");



CREATE OR REPLACE TRIGGER "set_timestamp_admin_profiles" BEFORE UPDATE ON "public"."admin_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp_categories" BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp_mundos" BEFORE UPDATE ON "public"."mundos" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp_playlist_folders" BEFORE UPDATE ON "public"."playlist_folders" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp_playlist_items" BEFORE UPDATE ON "public"."playlist_items" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp_playlists" BEFORE UPDATE ON "public"."playlists" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



ALTER TABLE ONLY "public"."admin_profiles"
    ADD CONSTRAINT "admin_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admin_profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."cycle_answers"
    ADD CONSTRAINT "cycle_answers_question_cycle_id_fkey" FOREIGN KEY ("question_cycle_id") REFERENCES "public"."question_cycles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."item_questions"
    ADD CONSTRAINT "item_questions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."playlist_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mundos"
    ADD CONSTRAINT "mundos_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admin_profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."playlist_folders"
    ADD CONSTRAINT "playlist_folders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admin_profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."playlist_folders"
    ADD CONSTRAINT "playlist_folders_mundo_id_fkey" FOREIGN KEY ("mundo_id") REFERENCES "public"."mundos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playlist_item_categories"
    ADD CONSTRAINT "playlist_item_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playlist_item_categories"
    ADD CONSTRAINT "playlist_item_categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admin_profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."playlist_item_categories"
    ADD CONSTRAINT "playlist_item_categories_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."playlist_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playlist_items"
    ADD CONSTRAINT "playlist_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admin_profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."playlist_items"
    ADD CONSTRAINT "playlist_items_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."playlist_folders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playlist_items"
    ADD CONSTRAINT "playlist_items_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playlists"
    ADD CONSTRAINT "playlists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admin_profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."playlists"
    ADD CONSTRAINT "playlists_mundo_id_fkey" FOREIGN KEY ("mundo_id") REFERENCES "public"."mundos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_cycles"
    ADD CONSTRAINT "question_cycles_item_question_id_fkey" FOREIGN KEY ("item_question_id") REFERENCES "public"."item_questions"("id") ON DELETE CASCADE;



CREATE POLICY "Allow admins or creators to update/delete categories" ON "public"."categories" USING ((("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])) OR ("created_by" = "auth"."uid"()))) WITH CHECK ((("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Allow admins or creators to update/delete folders" ON "public"."playlist_folders" USING ((("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])) OR ("created_by" = "auth"."uid"()))) WITH CHECK ((("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Allow admins or creators to update/delete mundos" ON "public"."mundos" USING ((("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])) OR ("created_by" = "auth"."uid"()))) WITH CHECK ((("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Allow admins or creators to update/delete playlists" ON "public"."playlists" USING ((("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])) OR ("created_by" = "auth"."uid"()))) WITH CHECK ((("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Allow admins to insert categories" ON "public"."categories" FOR INSERT WITH CHECK (("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])));



CREATE POLICY "Allow admins to insert folders" ON "public"."playlist_folders" FOR INSERT WITH CHECK (("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])));



CREATE POLICY "Allow admins to insert mundos" ON "public"."mundos" FOR INSERT WITH CHECK (("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])));



CREATE POLICY "Allow admins to insert playlists" ON "public"."playlists" FOR INSERT WITH CHECK (("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])));



CREATE POLICY "Allow admins to manage item-category links" ON "public"."playlist_item_categories" USING (("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))) WITH CHECK (("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])));



CREATE POLICY "Allow authenticated read access to categories" ON "public"."categories" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated read access to folders" ON "public"."playlist_folders" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated read access to item-category links" ON "public"."playlist_item_categories" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated read access to items" ON "public"."playlist_items" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated read access to mundos" ON "public"."mundos" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated read access to playlists" ON "public"."playlists" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to insert items" ON "public"."playlist_items" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read profiles" ON "public"."admin_profiles" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow creators to update/delete items" ON "public"."playlist_items" USING (("created_by" = "auth"."uid"())) WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Allow insert/update/delete by admins (answers)" ON "public"."cycle_answers" USING (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))) WITH CHECK (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))));



CREATE POLICY "Allow insert/update/delete by admins (cycles)" ON "public"."question_cycles" USING (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))) WITH CHECK (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))));



CREATE POLICY "Allow insert/update/delete by admins (folders)" ON "public"."playlist_folders" USING (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))) WITH CHECK (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))));



CREATE POLICY "Allow insert/update/delete by admins (items)" ON "public"."playlist_items" USING (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))) WITH CHECK (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))));



CREATE POLICY "Allow insert/update/delete by admins (mundos)" ON "public"."mundos" USING (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))) WITH CHECK (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))));



CREATE POLICY "Allow insert/update/delete by admins (playlists)" ON "public"."playlists" USING (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))) WITH CHECK (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))));



CREATE POLICY "Allow insert/update/delete by admins (questions)" ON "public"."item_questions" USING (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))) WITH CHECK (("auth"."uid"() IN ( SELECT "admin_profiles"."id"
   FROM "public"."admin_profiles"
  WHERE ("admin_profiles"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))));



CREATE POLICY "Allow read access to authenticated users (answers)" ON "public"."cycle_answers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to authenticated users (cycles)" ON "public"."question_cycles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to authenticated users (folders)" ON "public"."playlist_folders" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to authenticated users (items)" ON "public"."playlist_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to authenticated users (mundos)" ON "public"."mundos" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to authenticated users (playlists)" ON "public"."playlists" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to authenticated users (questions)" ON "public"."item_questions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow super_admins to delete profiles" ON "public"."admin_profiles" FOR DELETE USING (("public"."get_user_role"("auth"."uid"()) = 'super_admin'::"text"));



CREATE POLICY "Allow super_admins to update profiles" ON "public"."admin_profiles" FOR UPDATE USING (("public"."get_user_role"("auth"."uid"()) = 'super_admin'::"text")) WITH CHECK (("public"."get_user_role"("auth"."uid"()) = 'super_admin'::"text"));



CREATE POLICY "Allow users to insert their own profile" ON "public"."admin_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."admin_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cycle_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."item_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mundos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."playlist_folders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."playlist_item_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."playlist_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."playlists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_cycles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."swap_playlist_items_order"("p_item1_id" "uuid", "p_item2_id" "uuid", "p_playlist_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."swap_playlist_items_order"("p_item1_id" "uuid", "p_item2_id" "uuid", "p_playlist_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."swap_playlist_items_order"("p_item1_id" "uuid", "p_item2_id" "uuid", "p_playlist_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "service_role";



























GRANT ALL ON TABLE "public"."admin_profiles" TO "anon";
GRANT ALL ON TABLE "public"."admin_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."cycle_answers" TO "anon";
GRANT ALL ON TABLE "public"."cycle_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."cycle_answers" TO "service_role";



GRANT ALL ON TABLE "public"."item_questions" TO "anon";
GRANT ALL ON TABLE "public"."item_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."item_questions" TO "service_role";



GRANT ALL ON TABLE "public"."mundos" TO "anon";
GRANT ALL ON TABLE "public"."mundos" TO "authenticated";
GRANT ALL ON TABLE "public"."mundos" TO "service_role";



GRANT ALL ON TABLE "public"."playlist_folders" TO "anon";
GRANT ALL ON TABLE "public"."playlist_folders" TO "authenticated";
GRANT ALL ON TABLE "public"."playlist_folders" TO "service_role";



GRANT ALL ON TABLE "public"."playlist_item_categories" TO "anon";
GRANT ALL ON TABLE "public"."playlist_item_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."playlist_item_categories" TO "service_role";



GRANT ALL ON TABLE "public"."playlist_items" TO "anon";
GRANT ALL ON TABLE "public"."playlist_items" TO "authenticated";
GRANT ALL ON TABLE "public"."playlist_items" TO "service_role";



GRANT ALL ON TABLE "public"."playlists" TO "anon";
GRANT ALL ON TABLE "public"."playlists" TO "authenticated";
GRANT ALL ON TABLE "public"."playlists" TO "service_role";



GRANT ALL ON TABLE "public"."question_cycles" TO "anon";
GRANT ALL ON TABLE "public"."question_cycles" TO "authenticated";
GRANT ALL ON TABLE "public"."question_cycles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
