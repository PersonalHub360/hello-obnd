--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auth_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    username text NOT NULL
);


--
-- Name: call_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.call_reports (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_name text NOT NULL,
    call_agent_name text NOT NULL,
    date_time timestamp without time zone DEFAULT now() NOT NULL,
    call_status text NOT NULL,
    phone_number text NOT NULL,
    duration text,
    remarks text,
    call_type text
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: deposits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deposits (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    staff_name text NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL,
    brand_name text DEFAULT 'JB BDT'::text NOT NULL,
    ftd_count integer DEFAULT 0,
    deposit_count integer DEFAULT 0,
    total_calls integer DEFAULT 0,
    successful_calls integer DEFAULT 0,
    unsuccessful_calls integer DEFAULT 0,
    failed_calls integer DEFAULT 0,
    ftd text DEFAULT 'No'::text NOT NULL,
    deposit text DEFAULT 'No'::text NOT NULL
);


--
-- Name: google_sheets_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.google_sheets_config (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    spreadsheet_id text,
    spreadsheet_url text,
    access_token text,
    refresh_token text,
    token_expiry timestamp without time zone,
    is_connected integer DEFAULT 0,
    last_sync_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    employee_id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    country text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    join_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    department text,
    brand text,
    photo_url text,
    date_of_birth text,
    available_leave integer
);


--
-- Data for Name: auth_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_users (id, email, password, name, role, status, created_at, username) FROM stdin;
9b97e5ec-cbd2-4239-8696-ecdaaff8b30a	james@auroramy.com	Sp123456@@	james	user	active	2025-10-20 06:50:48.684286	james_auroramy.com
7343692b-5499-49dc-80cb-fdc5c97d2a72	test_uOMPul@test.com	TestPass123@	Test User test_uOMPul	Team Leader	active	2025-10-24 09:00:04.634653	test_uOMPul
0c5d802d-ebee-4f1b-987d-013899d74781	james.bond@auroramy.com	$2b$10$XQ2KG8cDK0iCGzMW7H2s9OjhKi/1BPFz64q6PnTaA21k126XobUfi	James Bond	admin	active	2025-10-20 06:13:20.439742	james.bond_auroramy.com
1ac70566-030b-47a8-936a-935e6e334aaf	c3fdKoF9@test.com	$2b$10$3r5g2gZE7SZb0kieZ5yAue0.ggH8PTZ0kov6jfmKFsTZusE4Po6Bu	Test User c3fdKoF9	Senior Manager	active	2025-10-24 09:08:41.845721	c3fdKoF9
f98693a0-7a47-4690-9c0c-066d0b954172	0JjXD2sY@test.com	$2b$10$gAXqI3D.6ZEYGXoleMZBg.L6sR.vFFc593tV/O4V2XWIDcx.2YaIO	Test User 0JjXD2sY	User	active	2025-10-24 09:14:14.490002	0JjXD2sY
67bbdc6d-128a-444d-ad74-ab6d04155d69	test_u864OPUz@test.com	$2b$10$hyK/gJlU2GQwz.2JBBnR3OgfA3VHvz1TWz/.cLnkG9jsTlcpj4rtm	Test User test_u864OPUz	Department Head	active	2025-10-24 09:19:29.911496	test_u864OPUz
d1764052-ae82-499e-bdec-319348310636	nazmul.haque@auroramy.com	$2b$10$nahcmDljtfNrkOy8F77AaOl28uqWbMx7r1pf6ZFLqag4Z5yS6KEde	Nazmul Haque	Assistant Leader	active	2025-10-24 19:36:49.443885	nazmulhaque
\.


--
-- Data for Name: call_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.call_reports (id, user_name, call_agent_name, date_time, call_status, phone_number, duration, remarks, call_type) FROM stdin;
d948d937-f7bb-43b5-808e-86b37c5966ce	  "Alice Customer"	Bob Agent	2025-10-18 05:00:56.457	Completed	+1-555-1234	12 mins	Product inquiry resolved	Support
57d5de7d-2881-4542-87f0-86634abab4f5	Test User	Test Agent	2025-10-18 05:01:28.904885	Follow-up Required	+1-555-9999	5 mins	Needs follow-up next week	Sales
54c445dc-e278-4461-84ae-0d720355b61d	Customer gNmd	Agent 7JrJ	2025-10-21 11:57:42.708402	Completed	+1-555-SN9J	10 mins	Test call report	Support
afc1a63c-061d-44fb-b036-553fe4310195	Test Customer	Auto Test	2025-10-24 08:31:41.337425	Completed	1234567890	\N	\N	\N
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, name, description, created_at) FROM stdin;
4f7a84cc-bac3-4c2e-a90d-1f464011ed34	Human Resources	HR and people operations	2025-10-20 12:05:11.202654
975edb05-bfa5-4f2c-95d0-3ee8d88b5b03	Sales	Sales and business development	2025-10-20 12:05:11.202654
a3130049-d1b4-432e-a58d-7a97cfdc002b	Marketing	Marketing and communications	2025-10-20 12:05:11.202654
6a897d88-4d3f-4725-a3aa-de122a309a94	Operations	Operations and support	2025-10-20 12:05:11.202654
ce49b203-bbf2-4fca-b1fc-ea589bc25b15	Test Dept D7XQ	Updated test department description	2025-10-20 12:18:12.250687
8424527e-ad8c-4f05-929c-b0f549060668	Team Leader		2025-10-20 13:28:39.594961
\.


--
-- Data for Name: deposits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deposits (id, staff_name, date, brand_name, ftd_count, deposit_count, total_calls, successful_calls, unsuccessful_calls, failed_calls, ftd, deposit) FROM stdin;
2c9ce8c8-0c92-49e2-8a3f-71ad40bfb20b	Abu Hanif	2025-10-27 00:00:00	BJ BDT	10	15	190	90	50	50	Yes	Yes
\.


--
-- Data for Name: google_sheets_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.google_sheets_config (id, spreadsheet_id, spreadsheet_url, access_token, refresh_token, token_expiry, is_connected, last_sync_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name, description, created_at) FROM stdin;
c3060511-5ff6-4fa4-ad0f-540ca589d690	Manager	Management role with supervisory responsibilities	2025-10-20 12:05:09.668229
b6f069ab-2ae4-4db9-8844-7cb3ffab1e89	Senior Developer	Experienced developer with advanced technical skills	2025-10-20 12:05:09.668229
ece8cc4a-ea90-4eb9-a005-6cc71ad636a4	Developer	Software development professional	2025-10-20 12:05:09.668229
8f835ede-9a14-4932-923c-c26cbd128aaf	Designer	UI/UX design specialist	2025-10-20 12:05:09.668229
b956489b-f76b-48bf-b93f-8b22661ef7ee	HR Specialist	Human resources management	2025-10-20 12:05:09.668229
7539f639-1210-42fe-bc95-3c005f8ea5be	Sales Executive	Sales and client relations	2025-10-20 12:05:09.668229
dbf3e740-abc4-4ef2-9396-5af5abfe9833	Test Role 0Bvq	Updated test role description	2025-10-20 12:15:06.438853
ec23370d-866d-48a3-b2cb-f1cc62e83a4c	OBND	Team Leader	2025-10-20 13:28:26.217285
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
yuylt-Olm5L72Qh4Ig_oK5z1kd7YGB4j	{"cookie":{"originalMaxAge":86400000,"expires":"2025-10-28T11:15:44.839Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"userId":"0c5d802d-ebee-4f1b-987d-013899d74781","username":"james.bond_auroramy.com","email":"james.bond@auroramy.com","name":"James Bond","role":"admin"}}	2025-10-28 11:18:27
Fx8LrrzkW4Mmm5xvChN87HyJkhZ19QKT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-11-05T04:54:17.579Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"userId":"0c5d802d-ebee-4f1b-987d-013899d74781","username":"james.bond_auroramy.com","email":"james.bond@auroramy.com","name":"James Bond","role":"admin"}}	2025-11-05 04:54:19
1f2DJpUomtMbaL6BAPe-DWaPlBPfowPr	{"cookie":{"originalMaxAge":86400000,"expires":"2025-11-05T04:36:13.295Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"userId":"0c5d802d-ebee-4f1b-987d-013899d74781","username":"james.bond_auroramy.com","email":"james.bond@auroramy.com","name":"James Bond","role":"admin"}}	2025-11-05 04:36:15
6wNnVKJe7P5yN28ZC6SacNt_bmUK7MSC	{"cookie":{"originalMaxAge":86400000,"expires":"2025-11-05T04:31:54.678Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"userId":"0c5d802d-ebee-4f1b-987d-013899d74781","username":"james.bond_auroramy.com","email":"james.bond@auroramy.com","name":"James Bond","role":"admin"}}	2025-11-05 04:58:52
t1mUJHM2Y-7mHlYciOF636OOx7IjkoDt	{"cookie":{"originalMaxAge":86400000,"expires":"2025-11-05T04:44:19.047Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"userId":"0c5d802d-ebee-4f1b-987d-013899d74781","username":"james.bond_auroramy.com","email":"james.bond@auroramy.com","name":"James Bond","role":"admin"}}	2025-11-05 04:47:23
YFr3LTO_hGNFSHlT0h_-KDhXXsRwlfvL	{"cookie":{"originalMaxAge":86400000,"expires":"2025-10-28T10:51:17.549Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"userId":"0c5d802d-ebee-4f1b-987d-013899d74781","username":"james.bond_auroramy.com","email":"james.bond@auroramy.com","name":"James Bond","role":"admin"}}	2025-10-28 10:51:56
eUO4jSrsrVQCdpQ7ywNP3SPZkibzL0bW	{"cookie":{"originalMaxAge":86400000,"expires":"2025-10-28T11:12:42.331Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"userId":"0c5d802d-ebee-4f1b-987d-013899d74781","username":"james.bond_auroramy.com","email":"james.bond@auroramy.com","name":"James Bond","role":"admin"}}	2025-10-28 11:12:43
-TfI-4aK1Axoh0tChu0xWN_MqkGSXzM8	{"cookie":{"originalMaxAge":86400000,"expires":"2025-11-05T04:40:29.279Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"userId":"0c5d802d-ebee-4f1b-987d-013899d74781","username":"james.bond_auroramy.com","email":"james.bond@auroramy.com","name":"James Bond","role":"admin"}}	2025-11-05 04:41:58
6E6t7RFyEFWfnlJfSiXkTMbuGJE33snd	{"cookie":{"originalMaxAge":86400000,"expires":"2025-10-28T10:31:13.472Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"userId":"0c5d802d-ebee-4f1b-987d-013899d74781","username":"james.bond_auroramy.com","email":"james.bond@auroramy.com","name":"James Bond","role":"admin"}}	2025-10-28 11:27:30
RZc8h7SGrcSE7bZb2Z02s8e1EHoYxCbp	{"cookie":{"originalMaxAge":86400000,"expires":"2025-10-28T10:54:35.138Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"userId":"0c5d802d-ebee-4f1b-987d-013899d74781","username":"james.bond_auroramy.com","email":"james.bond@auroramy.com","name":"James Bond","role":"admin"}}	2025-10-28 10:58:20
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff (id, employee_id, name, email, country, status, join_date, role, department, brand, photo_url, date_of_birth, available_leave) FROM stdin;
44fb8d54-5341-41e8-af26-cafd49450a93	AHNV00070	Sd Pitu	sd.pitu@auroramy.com	India	Active	2022-06-16 00:00:00	Assistant Manager	\N	BJ BDT	\N	\N	\N
ed6f5828-bad7-42b9-a7c0-fdb23366e835	AHNV00131	Partho Barua	partho.barua@auroramy.com	India	Active	2022-11-24 00:00:00	Team Leader	\N	BJ BDT	\N	\N	\N
929c7528-7d1e-4556-8ba9-0136eefc8006	AHNV00577	Nazmul Haque	nazmul.haque@auroramy.com	Bangladesh	Active	2023-08-31 00:00:00	Team Leader	\N	BJ BDT	\N	\N	\N
ed66984d-c910-4dcb-b4f1-f771df1863b3	AHNV00694	Abu Hanif	abu.hanif@auroramy.com	Bangladesh	Active	2023-10-13 00:00:00	Assistant Team Leader	\N	BJ BDT	\N	\N	\N
eaee2594-b901-4d09-ae02-9738e521806a	AHNV00714	Farouk Khan	farouk.khan@auroramy.com	Bangladesh	Active	2023-10-20 00:00:00	Assistant Team Leader	\N	BJ BDT	\N	\N	\N
44ad1afd-f065-4fa9-bfc9-73719a9601db	AHNV00719	Durjay Ahmed	durjay.ahmed@auroramy.com	Bangladesh	Active	2023-10-23 00:00:00	QA	\N	BJ BDT	\N	\N	\N
7c88583e-0108-429b-a4b4-116612bc9a1e	AHNV00720	Akter Hossain	akter.hossain@auroramy.com	Bangladesh	Active	2023-10-23 00:00:00	QA	\N	BJ BDT	\N	\N	\N
66fd3c7d-4576-4db2-8b9a-11deb071e4a2	AHNV00752	Albert Khan	albert.khan@auroramy.com	Bangladesh	Active	2023-10-27 00:00:00	QA	\N	BJ BDT	\N	\N	\N
bed79160-2f41-4a83-bfd9-c04966bb1169	AHNV00753	Shipon Sarkar	shipon.sarkar@auroramy.com	Bangladesh	Active	2023-10-27 00:00:00	QA	\N	BJ BDT	\N	\N	\N
7218d773-4b71-4091-8644-bf55f6a1c4c1	AHNV00953	Alisha Khan	alisha.khan@auroramy.com	India	Active	2024-01-04 00:00:00	Senior Sales Executive	\N	BJ BDT	\N	\N	\N
eefc01db-dab3-421a-9859-07995e4f1223	AHNV01433	Janhvi Basu	janhvi.basu@auroramy.com	India	Active	2024-06-08 00:00:00	Junior Sales Executive	\N	BJ BDT	\N	\N	\N
e292183e-a4fd-4d59-b96d-dd3a631345db	AHNV01912	Shamsul khan	shamsul.khan@auroramy.com	Bangladesh	Active	2024-11-11 00:00:00	Junior Sales Executive	\N	BJ BDT	\N	\N	\N
9c87adc9-793a-48f1-a1e5-173d23c3edc0	AHNV01961	Mehedi Islam	mehedi.islam@auroramy.com	Bangladesh	Active	2024-11-21 00:00:00	Junior Sales Executive	\N	BJ BDT	\N	\N	\N
e3b3eb35-526a-443a-8745-349ce0a9b2c1	AHNV01964	Ahnaf Khan	ahnaf.khan@auroramy.com	Bangladesh	Active	2024-11-21 00:00:00	Junior Sales Executive	\N	BJ BDT	\N	\N	\N
904405b3-9387-49a0-98fc-22603beede51	AHNV01977	Rajat Hussain	rajat.hussain@auroramy.com	Bangladesh	Active	2024-11-26 00:00:00	Junior Sales Executive	\N	BJ BDT	\N	\N	\N
07cabe2a-0603-433f-b132-093226b33389	AHNV01978	Tarikul Islam	tarikul.islam@auroramy.com	Bangladesh	Active	2024-11-26 00:00:00	Junior Sales Executive	\N	BJ BDT	\N	\N	\N
dc66fd1b-7a0c-4f57-b7e8-46e85afc82af	AHNV01979	Hasib Mia	hasib.mia@auroramy.com	Bangladesh	Active	2024-11-26 00:00:00	Junior Sales Executive	\N	BJ BDT	\N	\N	\N
4d8a1702-c554-408e-8eca-753f154da8bb	AHNV02045	Kiara Khan	kiara.khan@auroramy.com	Bangladesh	Active	2024-12-09 00:00:00	Junior Sales Executive	\N	BJ BDT	\N	\N	\N
6b62c98a-f4c8-4cd2-ab2a-f1b29a6cc418	AHNV02119	Sudur Hasan	sudur.hasan@auroramy.com	Bangladesh	Active	2024-12-18 00:00:00	Junior Sales Executive	\N	BJ BDT	\N	\N	\N
1b0b0f9e-2732-44c1-aaf6-3cd1b7b8349f	AHNV02154	Abram Khan	abram.khan@auroramy.com	Bangladesh	Active	2025-01-02 00:00:00	Junior Sales Executive	\N	BJ BDT	\N	\N	\N
9d018af4-9248-454b-85f4-b452d5b1f946	AHNV02194	Zaid Khan	zaid.khan@auroramy.com	Bangladesh	Active	2025-01-13 00:00:00	Junior Sales Executive	\N	BJ BDT	\N	\N	\N
16766af9-6c10-4528-a1e3-0d109d1d508c	AHNV02212	Mofiz Khan	mofiz.khan@auroramy.com	Bangladesh	Active	2025-01-17 00:00:00	Junior Sales Executive	\N	BJ BDT	\N	\N	\N
bb361074-bd77-4d36-83c1-63cdd37c6bfa	AHNV02561	Najiya Nira	najiya.nira@auroramy.com	Bangladesh	Active	2025-09-13 00:00:00	Sales Executive	\N	BJ BDT	\N	\N	\N
5a98445c-2052-432e-8331-9ea931950bf0	AHNV00686	Afif Hossain	afif.hossain@auroramy.com	Bangladesh	Active	2023-10-09 00:00:00	Senior Sales Executive	\N	JB BDT	\N	\N	\N
0ccacc5a-5bff-4b6b-b591-abf1fbc0f043	AHNV00790	Adnan Kabir	adnankabir.obnd@auroramy.com	Bangladesh	Active	2023-11-02 00:00:00	Senior Sales Executive	\N	JB BDT	\N	\N	\N
b2737ec0-fa47-4e12-aebc-6b5f3c2563bd	AHNV00816	Mizu Hossain	mizuhossain.obnd@auroramy.com	Bangladesh	Active	2025-10-24 16:31:15.953406	Junior Sales Executive	\N	JB BDT	\N	\N	\N
1a5de71c-4bd6-4006-a729-d6fe6926083c	AHNV00817	Zarif Islam	zarifislam.obnd@auroramy.com	Bangladesh	Active	2025-10-24 16:31:15.953406	Junior Sales Executive	\N	JB BDT	\N	\N	\N
6c707c8c-2958-45d6-8717-74f5dd9cb2cb	AHNV01004	Insana Khan	insana.khan@auroramy.com	Bangladesh	Active	2024-01-22 00:00:00	Junior Sales Executive	\N	JB BDT	\N	\N	\N
d2106738-878e-4a25-9abc-6f6ec6b1cc07	AHNV01055	Zoya Khan	zoya.khan@auroramy.com	Bangladesh	Active	2024-02-12 00:00:00	Senior Sales Executive	\N	JB BDT	\N	\N	\N
8e291a04-d1dc-44c4-a31c-00fccb51cac3	AHNV01056	Jitu Khan	jitu.khan@auroramy.com	Bangladesh	Active	2024-02-12 00:00:00	Senior Sales Executive	\N	JB BDT	\N	\N	\N
6d85e074-5184-4c47-aa97-bb34bcacfbf3	AHNV02184	Denar Ahmed	denar.ahmed@auroramy.com	Bangladesh	Active	2025-01-08 00:00:00	Junior Sales Executive	\N	JB BDT	\N	\N	\N
5a480da5-75d9-43b8-9736-647719f4e6f1	AHNV02305	Maruf Mridha	maruf.mridha@auroramy.com	Bangladesh	Active	2025-02-10 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
7e6110ae-a899-467c-965d-c0b68ded7bec	AHNV02340	Hamdan Khan	hamdan.khan@auroramy.com	Bangladesh	Active	2025-02-18 00:00:00	Junior Sales Executive	\N	JB BDT	\N	\N	\N
f61577c1-d72f-49d6-8c08-3827c0b3ef12	AHNV02348	Piash Ahmed	piash.ahmed@auroramy.com	Bangladesh	Active	2025-02-19 00:00:00	Junior Sales Executive	\N	JB BDT	\N	\N	\N
85fe6f0d-8ddb-4477-bc49-3c7125040f02	AHNV02364	Areeb Khan	areeb.khan@auroramy.com	Bangladesh	Active	2025-02-22 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
bf5a6cc3-e939-4198-8a9d-b5c816bb982a	AHNV02411	Srikanto Sen	srikanto.sen@auroramy.com	Bangladesh	Active	2025-04-14 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
c0e8ee7d-a5aa-4fcc-a13e-6ca08889e818	AHNV02412	Zaroon Khan	zaroon.khan@auroramy.com	Bangladesh	Active	2025-04-14 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
dfd72d55-c40f-418d-8594-c82d77c0b180	AHNV02413	Hemonta Sen	hemonta.sen@auroramy.com	Bangladesh	Active	2025-04-14 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
92790cd0-1621-4ab1-a1ca-5516d729a03a	AHNV02414	Didar Khan	didar.khan@auroramy.com	Bangladesh	Active	2025-04-14 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
c2b5a7df-9288-4eb9-908d-9589442862b7	AHNV02415	Atanu Jana	atanu.jana@auroramy.com	Bangladesh	Active	2025-04-14 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
efdd6e09-e48f-4f99-9aa8-980a340c8b9d	AHNV02416	Pranto Roy	pranto.roy@auroramy.com	Bangladesh	Active	2025-04-14 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
dce4e157-db81-4f8d-9816-b5e7ec4b410e	AHNV02420	Mubarak Khan	mubarak.khan@auroramy.com	Bangladesh	Active	2025-04-15 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
24c20e22-a2ae-4a9e-906b-7997bd3c4b09	AHNV02421	Aakif khan	aakif.khan@auroramy.com	Bangladesh	Active	2025-04-15 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
c1468ae4-88ea-420d-929f-80b86ac00d9d	AHNV02429	Sarower Khan	sarower.khan@auroramy.com	Bangladesh	Active	2025-04-25 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
2a76abb4-6ae1-4bcb-b05b-263d091936af	AHNV02430	Safwan Khan	safwan.khan@auroramy.com	Bangladesh	Active	2025-04-26 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
000a05f5-c9bb-4080-af60-53627e49a447	AHNV02432	Zubin Ray	zubin.ray@auroramy.com	India	Active	2025-04-30 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
9ecc5752-2e84-48ee-9fc6-2df2b43115bf	AHNV02436	Taizul Islam	taizul.islam@auroramy.com	Bangladesh	Active	2025-05-02 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
f43bbe95-1896-405d-a12a-8583ed9fe7a2	AHNV02445	Mohsin Khan	mohsin.khan@auroramy.com	Bangladesh	Active	2025-05-05 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
1d538b8b-00ef-4210-bafd-4cde5954ab6b	AHNV02446	Borhan Khan	borhan.khan@auroramy.com	Bangladesh	Active	2025-05-05 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
13fbd76e-03ef-40fe-913b-7cb6d240fe62	AHNV02447	Akbar Ali	akbar.ali@auroramy.com	Bangladesh	Active	2025-05-06 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
4678e251-4c3b-4361-af45-b061c6c3c379	AHNV02450	Faria Islam	faria.islam@auroramy.com	Bangladesh	Active	2025-05-07 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
93ee6cc6-806b-4283-8661-0c54d91583e3	AHNV02451	Ashfiq Khan	ashfiq.khan@auroramy.com	Bangladesh	Active	2025-05-09 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
eae8552a-f555-4e65-955d-ea064704f03e	AHNV02452	Istiak Khan	istiak.khan@auroramy.com	Bangladesh	Active	2025-05-09 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
d7fe460f-444d-40d3-81e7-a5309d5eab1c	AHNV02453	Jihan Khan	jihan.khan@auroramy.com	Bangladesh	Active	2025-05-10 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
4f9df43b-9b1d-45f1-9dee-bf8840b8d8f8	AHNV02468	Zakir Khan	zakir.khan@auroramy.com	Bangladesh	Active	2025-06-06 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
42086107-9b08-4727-bdfd-539a2770524e	AHNV02503	Arnila Esha	arnila.esha@auroramy.com	Bangladesh	Active	2025-07-14 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
8201ce86-8ecb-4cd7-bf3a-b8d4ea4cec55	AHNV02507	Sadia Simi	sadia.simi@auroramy.com	Bangladesh	Active	2025-07-24 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
a37d38e5-db7b-496d-a414-c5a2fd1e589f	AHNV02508	Ataur Rahman	ataur.rahman@auroramy.com	Bangladesh	Active	2025-07-24 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
dfa0e709-5e10-41bc-9462-e2e30d2bd180	AHNV02509	Soumen Khan	soumen.khan@auroramy.com	Bangladesh	Active	2025-07-28 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
ce47b3d5-87f5-475c-8eb6-cee0a2d92611	AHNV02510	Nazeef Islam	nazeef.islam@auroramy.com	Bangladesh	Active	2025-07-30 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
f39b02da-3ff5-4957-a2a3-df1f8961406c	AHNV02511	Ulfat Khan	ulfat.khan@auroramy.com	Bangladesh	Active	2025-07-30 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
24d93acb-9be3-418c-b39e-d97ed94124cc	AHNV02512	Tauhid Khan	tauhid.khan@auroramy.com	Bangladesh	Active	2025-08-01 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
c3e953d6-30df-40dd-b64b-d0beb4b53a9a	AHNV02517	Ishaaq Khan	ishaaq.khan@auroramy.com	Bangladesh	Active	2025-08-04 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
58fd882d-24fd-4393-b363-aff75b44a198	AHNV02518	Zakaria Khan	zakaria.khan@auroramy.com	Bangladesh	Active	2025-08-04 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
4ba99fb6-23d2-44bf-bbdb-afea2f5afd4f	AHNV02519	Imtiaz Ali	imtiaz.ali@auroramy.com	Bangladesh	Active	2025-08-04 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
c030d15e-9985-40ac-bb54-cfb6ffcdf8b5	AHNV02520	Jisan Khan	jisan.khan@auroramy.com	Bangladesh	Active	2025-08-04 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
351d6e34-def1-4066-aa14-86d78c9b4efa	AHNV02521	Mahafuz Alam	mahafuz.alam@auroramy.com	Bangladesh	Active	2025-08-06 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
e7bbbced-c863-47be-bf8c-5b9d5393d191	AHNV02522	Tariq Islam	tariq.islam@auroramy.com	Bangladesh	Active	2025-08-06 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
f700e274-2ae2-46e0-8832-da73094ce5c3	AHNV02523	Shahnoor Ahmed	shahnoor.ahmed@auroramy.com	Bangladesh	Active	2025-08-08 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
df434717-cb05-4636-a371-501f0d368e5e	AHNV02524	Taseen Khan	taseen.khan@auroramy.com	Bangladesh	Active	2025-08-08 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
a777e3b0-1a4c-44f6-854b-149f0c558cd4	AHNV02525	Mansif Khan	mansif.khan@auroramy.com	Bangladesh	Active	2025-08-11 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
3fddba88-a77c-4443-877b-e1d7ad85df50	AHNV02526	Nadif Khan	nadif.khan@auroramy.com	Bangladesh	Active	2025-08-11 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
cb517118-065e-49bc-80fb-5f0105446182	AHNV02534	Akshay Sen	akshay.sen@auroramy.com	Bangladesh	Active	2025-08-18 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
9a3a17dd-04f9-4c78-873f-b8ab08b6da0e	AHNV02535	Badal Roy	badal.roy@auroramy.com	Bangladesh	Active	2025-08-18 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
ef3b00a7-9221-4716-a087-1a46d4fdde73	AHNV02536	Azraq Khan	azraq.khan@auroramy.com	Bangladesh	Active	2025-08-18 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
31bcd843-0dc0-4cb0-bf0c-204d754ef275	AHNV02538	Rudra Sen	rudra.sen@auroramy.com	India	Active	2025-08-19 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
65d4cc24-4e7e-4b42-8656-04a66f7c231c	AHNV02539	Subhash Sen	subhash.sen@auroramy.com	Bangladesh	Active	2025-08-25 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
e5d9a472-135b-4cb4-a886-de58a54a36ee	AHNV02540	Tahmid Ali	tahmid.ali@auroramy.com	Bangladesh	Active	2025-08-25 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
33eeb322-7cc1-4e75-a324-ab043c518cf2	AHNV02543	Tanzid Hasan	tanzid.hasan@auroramy.com	Bangladesh	Active	2025-08-28 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
767cb055-4daf-4417-af59-46258cbfdbb2	AHNV02544	Sanwar Hossain	sanwar.hossain@auroramy.com	Bangladesh	Active	2025-08-28 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
c96fdc60-082a-4680-a1b8-e0ad049a40c0	AHNV02545	Rishav Sen	rishav.sen@auroramy.com	Bangladesh	Active	2025-08-28 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
7fd4eb26-7e89-4cd4-bfba-b636e63406fc	AHNV02546	Nabin Sen	nabin.sen@auroramy.com	Bangladesh	Active	2025-08-28 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
bb51e696-e0f5-4f6d-9575-21d84e02589d	AHNV02550	Razia Khan	razia.khan@auroramy.com	Bangladesh	Active	2025-09-08 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
1bd8e261-514c-41ed-8b28-3dfecfb037ac	AHNV02551	Sharif Khan	sharif.khan@auroramy.com	Bangladesh	Active	2025-09-08 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
c0a5c062-cf97-4dd9-bbaa-7c86df8a535a	AHNV02552	Motahar Hossain	motahar.hossain@auroramy.com	Bangladesh	Active	2025-09-08 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
5e18da4b-285e-4c2d-b468-ca1d4b9baa8f	AHNV02559	Barun Sen	barun.sen@auroramy.com	Bangladesh	Active	2025-09-10 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
f51d362b-e38a-454e-9c2b-2435b46e0093	AHNV02560	Ranjan Sen	ranjan.sen@auroramy.com	Bangladesh	Active	2025-09-11 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
4c36f232-b05d-4ad3-aa3d-d647239e05c0	AHNV02563	Ajith Sen	ajith.sen@auroramy.com	Bangladesh	Active	2025-09-29 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
116ff0d5-9f0a-4825-8f33-db92531df2cf	AHNV02564	Tazim Khan	tazim.khan@auroramy.com	Bangladesh	Active	2025-09-29 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
754701bd-c886-4382-9e92-9ed102d97900	AHNV02565	Dipak Shah	dipak.shah@auroramy.com	Bangladesh	Active	2025-09-29 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
41654873-922e-4e6e-b6a4-f62e82b22559	AHNV02567	Afaz khan	afaz.khan@auroramy.com	Bangladesh	Active	2025-10-06 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
8b7ff574-e7b7-467d-8438-681074d17b2c	AHNV02568	Masud khan	masud.khan@auroramy.com	Bangladesh	Active	2025-10-06 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
b8e98dd6-96ce-45d2-b426-f9339b6cc010	AHNV02569	Masum Khan	masum.khan@auroramy.com	Bangladesh	Active	2025-10-06 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
71a52fb2-9701-43ce-a6ce-212fba5feec5	AHNV02570	Mayed Khan	mayed.khan@auroramy.com	Bangladesh	Active	2025-10-06 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
b95feb4a-6249-448c-ad7f-c4f5488c277b	AHNV02571	Saifan Khan	saifan.khan@auroramy.com	Bangladesh	Active	2025-10-10 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
e92028ae-da83-4499-8cb2-00d9b10533dd	AHNV02572	Raiyan Islam	raiyan.islam@auroramy.com	Bangladesh	Active	2025-10-10 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
3608fbb6-d460-4a40-a434-d98c9b45d684	AHNV02575	Rafhan Khan	rafhan.khan@auroramy.com	Bangladesh	Active	2025-10-10 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
7c39d905-4e21-4c3d-9cd4-939bbf21cd7f	AHNV02576	Fazlul Khan	fazlul.khan@auroramy.com	Bangladesh	Active	2025-10-10 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
11a603ef-a9e7-4eac-9577-f00fdcfd7993	AHNV02577	Mayan Khan	mayan.khan@auroramy.com	Bangladesh	Active	2025-10-15 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
44c8052d-9d44-4156-8995-f0cac1f1a81b	AHNV02578	Imrul Kayes	imrul.kayes@auroramy.com	Bangladesh	Active	2025-10-20 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
8b4e9970-d1d9-4cd0-b766-71e46aadcb2e	AHNV02579	Jishu Shen	jishu.shen@auroramy.com	Bangladesh	Active	2025-10-20 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
e48b7d35-d00b-4404-86db-e0072c7383b9	AHNV02580	Kesab Mondol	kesab.mondol@auroramy.com	Bangladesh	Active	2025-10-20 00:00:00	Sales Executive	\N	JB BDT	\N	\N	\N
6f71f16c-105f-4fbc-8657-0b3daf84340f	AHNV00125	Umer Akmal	umer.akmal@auroramy.com	Pakistan	Active	2022-11-22 00:00:00	Team Leader	\N	BJ PKR	\N	\N	\N
8711bd17-6a3f-4672-8e8b-88cefd33a379	AHNV00136	Babar Azam	babar.azam@auroramy.com	Pakistan	Active	2022-11-28 00:00:00	QA	\N	BJ PKR	\N	\N	\N
a302fa3b-996c-4ca5-8da7-599eb3627cea	AHNV00155	Ahmed shehzad	ahmed.shehzad@auroramy.com	Pakistan	Active	2023-01-21 00:00:00	QA	\N	BJ PKR	\N	\N	\N
8f5168bd-e8ea-4be9-ac7c-687184b815fc	AHNV00167	Umar Gul	umar.gul@auroramy.com	Pakistan	Active	2023-02-02 00:00:00	QA	\N	BJ PKR	\N	\N	\N
2450a56c-ac6e-4678-a799-35b91e198407	AHNV00177	Jeff seid	jeff.seid@auroramy.com	India	Active	2023-02-23 00:00:00	QA	\N	BJ PKR	\N	\N	\N
b07c34e7-5654-4c06-bdd7-ab8d27051b42	AHNV00241	Shahid khan	shahid.khan@auroramy.com	Pakistan	Active	2023-04-11 00:00:00	Assistant Team Leader	\N	BJ PKR	\N	\N	\N
6f94505e-6296-44b1-972d-6bfc9a853bd7	AHNV00242	Khabib Ali	khabib.ali@auroramy.com	Pakistan	Active	2023-04-11 00:00:00	Assistant Team Leader	\N	BJ PKR	\N	\N	\N
4c6bd7a1-0f70-430e-92c6-56127b9547e9	AHNV00270	Matthew Barbosa	matthew.barbosa@auroramy.com	India	Active	2023-04-28 00:00:00	QA	\N	BJ PKR	\N	\N	\N
3a828170-0801-4b7e-9076-919e55778d35	AHNV00407	Moeen Ali	moeen.ali@auroramy.com	Pakistan	Active	2023-06-19 00:00:00	QA	\N	BJ PKR	\N	\N	\N
6d96e811-35e1-47e9-9832-1fac2a58cc8f	AHNV00415	Sheheryar Khan	sheheryar.khan@auroramy.com	Pakistan	Active	2023-06-23 00:00:00	Senior Sales Executive	\N	BJ PKR	\N	\N	\N
abaa381e-cdce-40fc-bd5e-16575e37062d	AHNV00422	Arham Khan	arham.khan@auroramy.com	Pakistan	Active	2023-06-27 00:00:00	Assistant Team Leader	\N	BJ PKR	\N	\N	\N
4fbe0ffb-e3c7-478f-8064-18cab5ce21f9	AHNV00473	Najaf Shah	najaf.shah@auroramy.com	Pakistan	Active	2023-07-17 00:00:00	Junior Sales Executive	\N	BJ PKR	\N	\N	\N
e8d4b923-483e-4461-8a62-6f229f448971	AHNV00564	Usama Mir	usama.mir@auroramy.com	Pakistan	Active	2023-08-26 00:00:00	Assistant Team Leader	\N	BJ PKR	\N	\N	\N
40908f47-084b-48e8-af32-8dbbe483716d	AHNV00673	Ruhi Malik	ruhi.malik@auroramy.com	Pakistan	Active	2023-10-02 00:00:00	Senior Sales Executive	\N	BJ PKR	\N	\N	\N
97d2fc38-59e9-4a8e-b355-966937d560ad	AHNV00674	Maya khan	maya.khan@auroramy.com	Pakistan	Active	2023-10-02 00:00:00	Senior Sales Executive	\N	BJ PKR	\N	\N	\N
e241cb18-a001-46c6-9e79-9e10af4ec87b	AHNV00676	Hazel Grace	hazel.grace@auroramy.com	Pakistan	Active	2023-10-02 00:00:00	Senior Sales Executive	\N	BJ PKR	\N	\N	\N
d2044800-a778-411b-8768-f4d461e20ae4	AHNV00938	Annie Malik	anniemalik.obnd@auroramy.com	Pakistan	Active	2024-01-01 00:00:00	Senior Sales Executive	\N	BJ PKR	\N	\N	\N
4ea1b4a0-5c50-46b5-bbbe-2fd51d70083b	AHNV00939	Haya Sheikh	hayasheikh.obnd@auroramy.com	Pakistan	Active	2024-01-01 00:00:00	Senior Sales Executive	\N	BJ PKR	\N	\N	\N
99074635-51e2-4e9d-aa7b-83c983a76b01	AHNV00940	Lizy Khan	lizykhan.obnd@auroramy.com	Pakistan	Active	2024-01-01 00:00:00	Senior Sales Executive	\N	BJ PKR	\N	\N	\N
b77ca54e-7cb0-495e-9e3e-a8dbb4671378	AHNV01063	Shahzain Khan	shahzain.khan@auroramy.com	Pakistan	Active	2024-02-14 00:00:00	Senior Sales Executive	\N	BJ PKR	\N	\N	\N
7a2c2948-ec2d-40ce-a17c-51885a0bcbc4	AHNV01256	Agha Salman	agha.salman@auroramy.com	Pakistan	Active	2024-04-05 00:00:00	Junior Sales Executive	\N	BJ PKR	\N	\N	\N
ccd6b261-fde1-4ef2-85f9-682baf191e9c	AHNV01408	Malahim Khan	malahim.khan@auroramy.com	Pakistan	Active	2024-06-02 00:00:00	Junior Sales Executive	\N	BJ PKR	\N	\N	\N
634f4969-e26b-4065-b5b7-02153aa98c78	AHNV01442	Wajid Khan	wajid.khan@auroramy.com	Pakistan	Active	2024-06-11 00:00:00	Junior Sales Executive	\N	BJ PKR	\N	\N	\N
5545c3b7-faba-4de6-9a16-389eb4225bc7	AHNV01447	Mirha Khan	mirha.khan@auroramy.com	Pakistan	Active	2024-06-12 00:00:00	Junior Sales Executive	\N	BJ PKR	\N	\N	\N
5a9c604d-f5cf-4696-a3d4-a5d269d6d77d	AHNV01729	Jamal Ali	jamal.ali@auroramy.com	Pakistan	Active	2024-09-19 00:00:00	Junior Sales Executive	\N	BJ PKR	\N	\N	\N
738b38f5-688d-4b9e-88af-b390430cc2f6	AHNV01762	Jazib Shah	jazib.shah@auroramy.com	Pakistan	Active	2024-09-28 00:00:00	Junior Sales Executive	\N	BJ PKR	\N	\N	\N
c1c750fc-7ab0-439c-8009-2ef388cfc50e	AHNV01832	Ashir Ali	ashir.ali@auroramy.com	Pakistan	Active	2024-10-16 00:00:00	Junior Sales Executive	\N	BJ PKR	\N	\N	\N
49f6c3d1-dd6b-4f21-9e66-da74760fe97e	AHNV01833	Fazi Khan	fazi.khan@auroramy.com	Pakistan	Active	2024-10-16 00:00:00	Junior Sales Executive	\N	BJ PKR	\N	\N	\N
7830966b-4e04-4cc8-b28e-2adbc98424b4	AHNV02372	Muneeb Shah	muneeb.shah@auroramy.com	Pakistan	Active	2025-02-24 00:00:00	Junior Sales Executive	\N	BJ PKR	\N	\N	\N
09b90fc0-8687-4959-b6a3-683bfb329689	AHNV01940	Faizan Ahmed	faizan.ahmed@auroramy.com	Pakistan	Active	2024-11-18 00:00:00	Junior Sales Executive	\N	JB PKR	\N	\N	\N
b6164d0e-0dad-4d29-b69a-fafe52530620	AHNV00235	Aimal Khan	aimal.khan@auroramy.com	Pakistan	Active	2023-04-04 00:00:00	Senior Sales Executive	\N	SIX6'S PKR	\N	\N	\N
14886e03-e1e1-40a1-a528-0619cc3ef324	AHNV01209	Shahbaz Khan	shahbaz.khan@auroramy.com	Pakistan	Active	2024-03-19 00:00:00	Senior Sales Executive	\N	SIX6'S PKR	\N	\N	\N
f9a84670-489e-4c47-b01d-1272e51686cb	AHNV01764	Anzy Khan	anzy.khan@auroramy.com	Pakistan	Active	2024-09-28 00:00:00	Junior Sales Executive	\N	SIX6'S PKR	\N	\N	\N
b9c8b007-0db8-43ae-a8cf-c69134c6d0c9	AHNV02228	Atif Aslam	atif.aslam@auroramy.com	Pakistan	Active	2025-01-22 00:00:00	Junior Sales Executive	\N	SIX6'S PKR	\N	\N	\N
\.


--
-- Name: auth_users auth_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_email_unique UNIQUE (email);


--
-- Name: auth_users auth_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_pkey PRIMARY KEY (id);


--
-- Name: auth_users auth_users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_username_unique UNIQUE (username);


--
-- Name: call_reports call_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call_reports
    ADD CONSTRAINT call_reports_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: deposits deposits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_pkey PRIMARY KEY (id);


--
-- Name: google_sheets_config google_sheets_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_sheets_config
    ADD CONSTRAINT google_sheets_config_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: staff staff_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_key UNIQUE (email);


--
-- Name: staff staff_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_employee_id_key UNIQUE (employee_id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- PostgreSQL database dump complete
--

