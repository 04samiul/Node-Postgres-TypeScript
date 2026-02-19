--
-- PostgreSQL database dump
--

\restrict EnpapaGFeMAMN4pyk8AjBwQrZbizuhf6yL4ddmVc5c4k6Fsznhh69ZVmhPY7y6p

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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
-- Name: classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classes (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    thumbnail text,
    video_url text NOT NULL,
    tag text NOT NULL,
    access text DEFAULT 'all'::text NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.classes OWNER TO postgres;

--
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.classes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.classes_id_seq OWNER TO postgres;

--
-- Name: classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.classes_id_seq OWNED BY public.classes.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    banner_image text,
    last_date timestamp without time zone,
    price real DEFAULT 0 NOT NULL,
    offer_price real,
    access text DEFAULT 'all'::text NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'approved'::text NOT NULL
);


ALTER TABLE public.enrollments OWNER TO postgres;

--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enrollments_id_seq OWNER TO postgres;

--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: hero_banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hero_banners (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    image_url text,
    link_url text,
    is_visible boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.hero_banners OWNER TO postgres;

--
-- Name: hero_banners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hero_banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hero_banners_id_seq OWNER TO postgres;

--
-- Name: hero_banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hero_banners_id_seq OWNED BY public.hero_banners.id;


--
-- Name: mock_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mock_submissions (
    id integer NOT NULL,
    mock_test_id integer NOT NULL,
    user_id integer NOT NULL,
    answers jsonb NOT NULL,
    total_marks real,
    engp_marks real,
    engo_marks real,
    as_marks real,
    ps_marks real,
    net_marks real,
    passed boolean,
    is_submitted boolean DEFAULT false NOT NULL,
    started_at timestamp without time zone DEFAULT now() NOT NULL,
    submitted_at timestamp without time zone
);


ALTER TABLE public.mock_submissions OWNER TO postgres;

--
-- Name: mock_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mock_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mock_submissions_id_seq OWNER TO postgres;

--
-- Name: mock_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mock_submissions_id_seq OWNED BY public.mock_submissions.id;


--
-- Name: mock_tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mock_tests (
    id integer NOT NULL,
    title text NOT NULL,
    tag text NOT NULL,
    publish_time timestamp without time zone NOT NULL,
    duration integer DEFAULT 60 NOT NULL,
    questions jsonb NOT NULL,
    access text DEFAULT 'all'::text NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mock_tests OWNER TO postgres;

--
-- Name: mock_tests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mock_tests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mock_tests_id_seq OWNER TO postgres;

--
-- Name: mock_tests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mock_tests_id_seq OWNED BY public.mock_tests.id;


--
-- Name: notices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notices (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    tag text NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    url text,
    date timestamp without time zone
);


ALTER TABLE public.notices OWNER TO postgres;

--
-- Name: notices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notices_id_seq OWNER TO postgres;

--
-- Name: notices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notices_id_seq OWNED BY public.notices.id;


--
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resources (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    file_url text NOT NULL,
    tag text NOT NULL,
    access text DEFAULT 'all'::text NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.resources OWNER TO postgres;

--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resources_id_seq OWNER TO postgres;

--
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_settings_id_seq OWNER TO postgres;

--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    name text NOT NULL,
    post text NOT NULL,
    photo text,
    description text,
    socials jsonb,
    sort_order integer DEFAULT 0 NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.team_members OWNER TO postgres;

--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.team_members_id_seq OWNER TO postgres;

--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    whatsapp text NOT NULL,
    role text DEFAULT 'student'::text NOT NULL,
    is_premium boolean DEFAULT false NOT NULL,
    is_restricted boolean DEFAULT false NOT NULL,
    hsc_roll text NOT NULL,
    hsc_reg text NOT NULL,
    hsc_year text NOT NULL,
    hsc_group text NOT NULL,
    hsc_board text NOT NULL,
    ssc_roll text NOT NULL,
    ssc_reg text NOT NULL,
    ssc_year text NOT NULL,
    ssc_group text NOT NULL,
    ssc_board text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    is_second_timer boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: classes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes ALTER COLUMN id SET DEFAULT nextval('public.classes_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: hero_banners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hero_banners ALTER COLUMN id SET DEFAULT nextval('public.hero_banners_id_seq'::regclass);


--
-- Name: mock_submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mock_submissions ALTER COLUMN id SET DEFAULT nextval('public.mock_submissions_id_seq'::regclass);


--
-- Name: mock_tests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mock_tests ALTER COLUMN id SET DEFAULT nextval('public.mock_tests_id_seq'::regclass);


--
-- Name: notices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notices ALTER COLUMN id SET DEFAULT nextval('public.notices_id_seq'::regclass);


--
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classes (id, title, description, thumbnail, video_url, tag, access, is_visible, created_by, created_at) FROM stdin;
1	Introduction TO Numbers | Class No 001 | Crack-CU Batch 001		\N	https://youtu.be/ot3iuJ5j24w?si=RfRsTQT1SkbmbL4Z	Problem Solving	paid	t	1	2026-02-08 20:04:14.004145
3	dfs	gfdg	/objects/uploads/12f4909e-b606-4b76-a2f0-1b36841dc95f	https://youtu.be/ot3iuJ5j24w?si=RfRsTQT1SkbmbL4Z	Analytical Skill	all	t	1	2026-02-08 21:55:25.29583
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, title, description, banner_image, last_date, price, offer_price, access, is_visible, created_by, created_at) FROM stdin;
1	Free Mock Tests	ffsd	\N	\N	0	\N	signin	t	1	2026-02-08 20:03:01.378941
2	gfdgfd	fdgfdg	\N	\N	10	1	signin	t	1	2026-02-08 20:04:38.093564
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollments (id, user_id, course_id, created_at, status) FROM stdin;
1	1	1	2026-02-09 06:32:17.46595	approved
2	1	2	2026-02-09 06:32:20.04924	approved
3	4	2	2026-02-09 06:41:17.660754	approved
4	4	1	2026-02-09 06:52:18.304377	approved
\.


--
-- Data for Name: hero_banners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hero_banners (id, title, description, image_url, link_url, is_visible, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: mock_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mock_submissions (id, mock_test_id, user_id, answers, total_marks, engp_marks, engo_marks, as_marks, ps_marks, net_marks, passed, is_submitted, started_at, submitted_at) FROM stdin;
1	4	1	{"1": 2}	-0.5	-0.5	0	0	0	-0.5	f	t	2026-02-08 20:59:19.820322	2026-02-08 20:59:19.819
2	6	1	{"1": 1, "2": 0, "3": 0, "5": 0, "6": 3, "7": 2}	3.5	3.5	1	-1	0	3.5	f	t	2026-02-08 21:18:57.324203	2026-02-08 21:18:57.323
3	6	3	{"1": 1, "2": 0, "3": 1, "4": 1, "6": 1, "7": 2, "8": 2, "9": 2, "10": 2, "11": 2, "12": 3}	-2.75	1	-0.25	-2	-1.5	-2.75	f	t	2026-02-08 21:20:01.068869	2026-02-08 21:20:01.068
4	7	3	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0}	22	6	2	8	6	22	f	t	2026-02-08 21:34:39.626657	2026-02-08 21:34:39.625
5	8	3	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0, "16": 0, "17": 0, "18": 0, "19": 0, "20": 0, "21": 0, "22": 0, "23": 0, "24": 0, "25": 0, "26": 0, "27": 0, "28": 0, "29": 0, "30": 0, "31": 0, "32": 0, "33": 0, "34": 0, "35": 0, "36": 0, "37": 0, "38": 0, "39": 0, "41": 0, "42": 0, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 0, "51": 0, "52": 0, "53": 0, "54": 0, "55": 0, "56": 0, "57": 0, "58": 0, "59": 0, "61": 0, "62": 0, "63": 0, "64": 0, "65": 0}	94	6	30	28	30	94	f	t	2026-02-08 21:36:55.146799	2026-02-08 21:36:55.145
6	8	3	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}	6	6	0	0	0	3	f	t	2026-02-08 21:37:24.317018	2026-02-08 21:37:24.316
7	9	3	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}	10	10	0	0	0	10	f	t	2026-02-08 21:41:19.41355	2026-02-08 21:41:19.412
8	9	4	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}	10	10	0	0	0	7	f	t	2026-02-09 06:55:56.061067	2026-02-09 06:55:56.06
9	9	4	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}	10	10	0	0	0	10	f	t	2026-02-09 08:38:25.965012	2026-02-09 08:38:25.963
10	10	4	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}	10	10	0	0	0	10	f	t	2026-02-09 08:40:34.285101	2026-02-09 08:40:34.283
11	11	4	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0, "16": 0, "17": 0, "18": 0, "19": 0, "20": 0, "21": 0, "22": 0, "23": 0, "24": 0, "25": 0, "26": 0, "27": 0, "28": 0, "29": 0, "30": 0, "31": 0, "32": 0, "33": 0, "34": 0, "35": 0, "36": 0, "37": 0, "38": 0, "39": 0, "40": 0, "41": 0, "42": 0, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 0, "51": 0, "52": 0, "53": 0, "54": 0, "55": 0, "56": 0, "57": 0, "58": 0, "59": 0, "61": 0, "62": 0, "63": 0, "64": 0, "65": 0}	98	8	30	30	30	98	f	t	2026-02-09 08:48:18.244226	2026-02-09 08:48:18.243
12	11	4	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0, "16": 0, "17": 0, "18": 0, "19": 0, "20": 0, "21": 0, "22": 0, "23": 0, "24": 0, "25": 0, "26": 0, "27": 0, "28": 0, "29": 0, "30": 0, "31": 0, "32": 0, "33": 0, "34": 0, "35": 0, "36": 0, "37": 0, "38": 0, "39": 0, "40": 0, "41": 0, "42": 0, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 0, "51": 0, "52": 0, "53": 0, "54": 0, "55": 0, "56": 0, "57": 0, "58": 0, "59": 0, "60": 0, "61": 0, "62": 0, "63": 0, "64": 0, "65": 0}	98	8	30	30	30	98	f	t	2026-02-09 08:56:12.849677	2026-02-09 08:56:12.848
13	12	4	{"36": 0, "37": 0, "38": 0, "39": 0, "40": 0, "41": 0, "42": 0, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 0}	30	0	0	30	0	30	f	t	2026-02-09 08:59:12.545726	2026-02-09 08:59:12.545
14	12	4	{"36": 0, "37": 0, "38": 0, "39": 0, "40": 0, "41": 0, "42": 0, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 2}	27.5	0	0	27.5	0	27.5	f	t	2026-02-09 08:59:51.755396	2026-02-09 08:59:51.754
15	12	4	{"36": 3, "37": 0, "38": 0, "39": 0, "40": 0, "41": 0, "42": 0, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 3}	25	0	0	25	0	25	f	t	2026-02-09 09:00:55.905633	2026-02-09 09:00:55.905
16	13	4	{"51": 0, "52": 0, "53": 0, "54": 0, "55": 0, "56": 0, "57": 0, "58": 0, "59": 0, "60": 0, "61": 0, "62": 0, "63": 0, "64": 0, "65": 3}	27.5	0	0	0	27.5	27.5	f	t	2026-02-09 09:02:09.826937	2026-02-09 09:02:09.826
17	11	4	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0, "16": 0, "17": 0, "18": 0, "19": 0, "20": 0, "21": 0, "22": 0, "23": 0, "24": 0, "25": 0, "26": 0, "27": 0, "28": 0, "29": 0, "30": 0, "31": 0, "32": 0, "33": 0, "34": 0, "35": 0, "36": 0, "37": 0, "38": 0, "39": 0, "40": 0, "41": 0, "42": 0, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 0, "51": 0, "52": 0, "53": 0, "54": 0, "55": 0, "56": 0, "57": 0, "58": 0, "59": 0, "60": 0, "61": 0, "62": 0, "63": 0, "64": 0, "65": 0}	98	8	30	30	30	98	t	t	2026-02-09 09:26:18.409318	2026-02-09 09:26:18.407
18	11	4	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0, "16": 0, "17": 0, "18": 0, "19": 0, "20": 0, "21": 0, "22": 0, "23": 0, "24": 0, "25": 0, "26": 0, "27": 0, "28": 0, "29": 0, "30": 0, "31": 0, "32": 0, "33": 0, "34": 0, "35": 0, "36": 0, "37": 0, "38": 0, "39": 0, "40": 0, "41": 0, "42": 0, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 0, "51": 0, "52": 0, "53": 0, "54": 0, "55": 0, "56": 0, "57": 0, "58": 0, "59": 0, "60": 0, "61": 0, "62": 0, "63": 0, "64": 0, "65": 0}	98	8	30	30	30	98	t	t	2026-02-09 09:29:40.731857	2026-02-09 09:29:40.73
19	16	4	{"51": 0, "52": 0, "53": 0, "54": 0, "55": 0, "56": 0, "57": 0, "58": 0, "59": 0, "60": 0, "61": 0, "62": 0, "63": 0, "64": 0, "65": 0}	30	0	0	0	30	30	f	t	2026-02-09 09:32:12.935735	2026-02-09 09:32:12.935
20	16	4	{"51": 0, "52": 0, "53": 0, "54": 0, "55": 0, "56": 0, "57": 0, "58": 0, "59": 0, "60": 0, "61": 0, "62": 0, "63": 0, "65": 1}	25.5	0	0	0	25.5	25.5	f	t	2026-02-09 09:32:53.899588	2026-02-09 09:32:53.898
21	15	4	{"36": 0, "37": 0, "38": 0, "39": 0, "40": 0, "41": 0, "42": 0, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 0}	30	0	0	30	0	30	f	t	2026-02-09 09:34:27.615872	2026-02-09 09:34:27.615
22	15	4	{"36": 0, "37": 0, "39": 1, "40": 0, "41": 0, "42": 0, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 0}	25.5	0	0	25.5	0	25.5	f	t	2026-02-09 09:35:12.645166	2026-02-09 09:35:12.644
23	15	4	{"36": 0, "37": 0, "38": 0, "39": 0, "40": 0, "41": 0, "42": 1, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 0}	27.5	0	0	27.5	0	27.5	f	t	2026-02-09 09:35:58.899892	2026-02-09 09:35:58.899
24	15	4	{"36": 2, "37": 0, "38": 0, "39": 0, "40": 0, "41": 0, "42": 0, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 0}	27.5	0	0	27.5	0	27.5	f	t	2026-02-09 09:36:37.325554	2026-02-09 09:36:37.325
25	17	4	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}	10	10	0	0	0	10	f	t	2026-02-09 09:38:45.754822	2026-02-09 09:38:45.754
26	11	4	{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0, "16": 0, "17": 0, "18": 0, "19": 0, "20": 0, "21": 0, "22": 0, "23": 0, "24": 0, "25": 0, "26": 0, "27": 0, "28": 0, "29": 0, "30": 0, "31": 0, "32": 0, "33": 0, "34": 0, "35": 0, "36": 0, "37": 0, "38": 0, "39": 0, "40": 0, "41": 0, "42": 0, "43": 0, "44": 0, "45": 0, "46": 0, "47": 0, "48": 0, "49": 0, "50": 0, "51": 0, "52": 0, "53": 0, "54": 0, "55": 0, "56": 0, "57": 0, "58": 0, "59": 0, "60": 0, "61": 0, "62": 0, "63": 0, "64": 0, "65": 0}	100	10	30	30	30	100	t	t	2026-02-09 09:41:35.663751	2026-02-09 09:41:35.663
\.


--
-- Data for Name: mock_tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mock_tests (id, title, tag, publish_time, duration, questions, access, is_visible, created_by, created_at) FROM stdin;
1	gfdgfdg	CU Mock	0434-01-01 00:00:00	60	[]	signin	t	1	2026-02-08 20:03:22.268115
2	cxvxcv	CU Mock	2026-02-09 02:28:00	60	[{"id": 1, "image": null, "options": ["Option A", "Option B", "Option C", "Option D"], "passage": "This is a test passage.", "section": "EngP", "question": "What is the purpose of this passage?", "correctAnswer": 0}, {"id": 2, "image": null, "options": ["Option A", "Option B", "Option C", "Option D"], "passage": null, "section": "EngO", "question": "Choose the correct synonym.", "correctAnswer": 2}, {"id": 3, "image": null, "options": ["Option A", "Option B", "Option C", "Option D"], "passage": null, "section": "AS", "question": "Solve the analytical problem.", "correctAnswer": 1}, {"id": 4, "image": null, "options": ["Option A", "Option B", "Option C", "Option D"], "passage": null, "section": "PS", "question": "Solve the math problem.", "correctAnswer": 3}]	all	t	1	2026-02-08 20:28:25.140994
3	fdgfd	CU Mock	2026-02-09 02:31:00	60	[{"id": 1, "image": null, "options": ["Option A", "Option B", "Option C", "Option D"], "passage": "This is a test passage.", "section": "EngP", "question": "What is the purpose of this passage?", "correctAnswer": 0}, {"id": 2, "image": null, "options": ["Option A", "Option B", "Option C", "Option D"], "passage": null, "section": "EngO", "question": "Choose the correct synonym.", "correctAnswer": 2}, {"id": 3, "image": null, "options": ["Option A", "Option B", "Option C", "Option D"], "passage": null, "section": "AS", "question": "Solve the analytical problem.", "correctAnswer": 1}, {"id": 4, "image": null, "options": ["Option A", "Option B", "Option C", "Option D"], "passage": null, "section": "PS", "question": "Solve the math problem.", "correctAnswer": 3}]	all	t	1	2026-02-08 20:29:53.717682
4	gdfg	CU Mock	2026-02-08 20:59:00	60	[{"id": 1, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}]	all	t	1	2026-02-08 20:57:19.882459
5	fdg	CU Mock	2026-02-08 21:01:00	60	[{"id": 1, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "<u>bal</u>", "correctAnswer": 0}]	signin	t	1	2026-02-08 20:58:22.911633
6	vxc	CU Mock	2026-02-08 21:14:00	60	[{"id": 1, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 2, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 3, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 4, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 5, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 6, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 7, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 8, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 9, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 10, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 11, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 12, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}]	all	t	1	2026-02-08 21:17:58.75987
7	ter	Analytical Skill	2026-02-08 21:20:00	60	[{"id": 1, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "<b>dfsdfsdfs</b>", "correctAnswer": 0}, {"id": 2, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "<u>dfsdfsdfs</u>", "correctAnswer": 0}, {"id": 3, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 4, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 5, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 6, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 7, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 8, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 9, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 10, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 11, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 12, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}]	all	t	1	2026-02-08 21:21:14.076134
8	test	CU Mock	2026-02-08 21:33:00	60	[{"id": 1, "image": null, "options": ["A", "B", "C", "D"], "passage": "impLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 2, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 3, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 4, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "Engp", "question": "...", "correctAnswer": 0}, {"id": 5, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "Engp", "question": "<u>publishing software like Aldus</u> ", "correctAnswer": 0}, {"id": 6, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 7, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 8, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 9, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 10, "image": "/objects/uploads/1bebb60a-f8e2-4987-bdea-0261e9a5e5b3", "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 11, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 12, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 13, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 14, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 15, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 16, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 17, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 18, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 19, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 20, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 21, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 22, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 23, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 24, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 25, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 26, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 27, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 28, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 29, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 30, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 31, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 32, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 33, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 34, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 35, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 36, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 37, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 38, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 39, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 41, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 42, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 43, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 44, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 45, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 46, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 47, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 48, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 49, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 50, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 51, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 52, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 53, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 52, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 54, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 55, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 56, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 57, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 58, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 59, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 61, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 62, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 63, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 64, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 65, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}]	signin	t	1	2026-02-08 21:33:43.694759
9	gfdgf	English	2026-02-08 21:40:00	1	[{"id": 1, "image": null, "options": ["A", "B", "C", "D"], "passage": "impLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 2, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 2, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 3, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 4, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 5, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "Engp", "question": "...", "correctAnswer": 0}]	signin	t	1	2026-02-08 21:39:00.654495
10	dfdf	CU Mock	2026-02-08 22:07:00	60	[{"id": 1, "image": null, "options": ["A", "B", "C", "D"], "passage": "impLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 2, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 2, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 3, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 4, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "...", "correctAnswer": 0}, {"id": 5, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "Engp", "question": "...", "correctAnswer": 0}]	paid	t	1	2026-02-08 22:07:29.762896
15	as2	Analytical Skill	2026-02-09 09:30:00	60	[{"id": 36, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 37, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 38, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 39, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 40, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 41, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 42, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 43, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 44, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 45, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 46, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 47, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 48, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 49, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 50, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}]	all	t	1	2026-02-09 09:31:06.101007
16	ps2	Problem Solving	2026-02-09 09:31:00	60	[{"id": 51, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 52, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 53, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 54, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 55, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 56, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 57, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 58, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 59, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 60, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 61, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 62, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 63, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 64, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 65, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}]	all	t	1	2026-02-09 09:31:39.826487
12	as	Analytical Skill	2026-02-09 08:57:00	60	[{"id": 36, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 37, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 38, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 39, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 40, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 41, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 42, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 43, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 44, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 45, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 46, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 47, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 48, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 49, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 50, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}]	all	t	1	2026-02-09 08:58:19.861106
13	ps	Problem Solving	2026-02-09 09:01:00	60	[{"id": 51, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 52, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 53, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 54, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 55, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 56, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 57, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 58, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 59, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 60, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 61, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 62, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 63, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 64, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 65, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}]	all	t	1	2026-02-09 09:01:38.864126
14	Eng 2	English	2026-02-09 09:30:00	60	[{"id": 1, "image": null, "options": ["A", "B", "C", "D"], "passage": "impLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", "section": "EngP", "question": "1.", "correctAnswer": 0}, {"id": 2, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "2", "correctAnswer": 0}, {"id": 3, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "4...", "correctAnswer": 0}, {"id": 4, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": ".5..", "correctAnswer": 0}, {"id": 5, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "Engp", "question": "<u>publishing software like Aldus</u> ", "correctAnswer": 0}, {"id": 6, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 7, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 8, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 9, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 10, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 11, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 12, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 13, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 14, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 15, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 16, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 17, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 18, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 19, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 20, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 21, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 22, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 23, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 24, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 25, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 26, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 27, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 28, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 29, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 30, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 31, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 32, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 33, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 34, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 35, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}]	all	t	1	2026-02-09 09:30:26.416618
17	engp	English	2026-02-09 09:37:00	60	[{"id": 1, "image": null, "options": ["A", "B", "C", "D"], "passage": "impLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", "section": "EngP", "question": "1.", "correctAnswer": 0}, {"id": 2, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "2", "correctAnswer": 0}, {"id": 3, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "4...", "correctAnswer": 0}, {"id": 4, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": ".5..", "correctAnswer": 0}, {"id": 5, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "<u>publishing software like Aldus</u> ", "correctAnswer": 0}]	all	t	1	2026-02-09 09:37:44.77871
11	test full	CU Mock	2026-02-09 08:43:00	60	[{"id": 1, "image": null, "options": ["A", "B", "C", "D"], "passage": "impLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", "section": "EngP", "question": "1.", "correctAnswer": 0}, {"id": 2, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "2", "correctAnswer": 0}, {"id": 3, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "4...", "correctAnswer": 0}, {"id": 4, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": ".5..", "correctAnswer": 0}, {"id": 5, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngP", "question": "<u>publishing software like Aldus</u> ", "correctAnswer": 0}, {"id": 6, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 7, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 8, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 9, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 10, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 11, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 12, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 13, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 14, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 15, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 16, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 17, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 18, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 19, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 20, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 21, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 22, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 23, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 24, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 25, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 26, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 27, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 28, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 29, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 30, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 31, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 32, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 33, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 34, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 35, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "EngO", "question": "...", "correctAnswer": 0}, {"id": 36, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 37, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 38, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 39, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 40, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 41, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 42, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 43, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 44, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 45, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 46, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 47, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 48, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 49, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 50, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "AS", "question": "...", "correctAnswer": 0}, {"id": 51, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 52, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 53, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 54, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 55, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 56, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 57, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 58, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 59, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 60, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 61, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 62, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 63, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 64, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}, {"id": 65, "image": null, "options": ["A", "B", "C", "D"], "passage": null, "section": "PS", "question": "...", "correctAnswer": 0}]	paid	t	1	2026-02-09 08:42:11.1178
\.


--
-- Data for Name: notices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notices (id, title, description, tag, is_visible, created_by, created_at, url, date) FROM stdin;
1	চট্টগ্রাম বিশ্ববিদ্যালয়ের ২০২৫-২০২৬ শিক্ষাবর্ষের ১ম বর্ষ অনার্স (সম্মান) শ্রেণীর বিভাগ মনোনয়ন এবং প্রাথমিক ভর্তি সংক্রান্ত বিজ্ঞপ্তি	চট্টগ্রাম বিশ্ববিদ্যালয়ের ২০২৫-২০২৬ শিক্ষাবর্ষের ১ম বর্ষ অনার্স (সম্মান) শ্রেণীর বিভাগ মনোনয়ন এবং প্রাথমিক ভর্তি সংক্রান্ত বিজ্ঞপ্তি	CU	t	1	2026-02-09 07:15:25.098128	\N	\N
2	চট্টগ্রাম বিশ্ববিদ্যালয়ের ২০২৫-২০২৬ শিক্ষাবর্ষের ১ম বর্ষ অনার্স (সম্মান) শ্রেণীর বিভাগ মনোনয়ন এবং প্রাথমিক ভর্তি সংক্রান্ত বিজ্ঞপ্তি	২০২৫-২০২৬ শিক্ষাবর্ষে ১ম বর্ষ স্নাতক (সম্মান) শ্রেণিতে ভর্তিচ্ছু শিক্ষার্থী এবং সংশ্লিষ্ট সকলের অবগতির জন্য আদেশক্রমে জানানো যাচ্ছে যে ১ম বর্ষ স্নাতক (সম্মান) শ্রেণিতে সকল ইউনিট/উপ-ইউনিটে মেধা তালিকায় উত্তীর্ণ সাধারণ ও কোটার আসনে বিভাগ/ ইনস্টিটিউট মনোনয়ন প্রাপ্তদের ১ম তালিকা আগামী ১৮ ফেব্রুয়ারি ২০২৬ তারিখে অনলাইনে প্রকাশ করা হবে।\n১ম তালিকায় সাধারণ ও কোটার আসনে বিভাগ/ইনস্টিটিউট মনোনয়ন প্রাপ্তদের প্রাথমিক ভর্তি কার্যক্রম আগামী "২২ ফেব্রুয়ারি থেকে ২৬ ফেব্রুয়ারি ২০২৬ তারিখ" পর্যন্ত (অফিস চলাকালীন) চলবে।\nএ সংক্রান্ত বিস্তারিত বিজ্ঞপ্তি সংশ্লিষ্ট ইউনিট অফিস কর্তৃক যথাসময়ে ইস্যু করা হবে।\n	CU Notice	t	1	2026-02-09 08:25:39.28377	https://cu-admission.sgp1.digitaloceanspaces.com/storage/documents/Notice_1770017894.pdf	2026-02-01 18:00:00
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resources (id, title, description, file_url, tag, access, is_visible, created_by, created_at) FROM stdin;
1	Introduction TO Numbers | Class No 001 | Crack-CU Batch 001	hgfh	https://youtu.be/ot3iuJ5j24w?si=RfRsTQT1SkbmbL4Z	CU QB	signin	t	1	2026-02-08 20:05:42.977471
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
P9OG50Eom0alX5BdZGr9fq--rhXE9F1R	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-03-10T20:27:21.118Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-03-11 16:23:29
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, key, value) FROM stdin;
1	timer_rules	[{"status": "1st_timer", "hscYear": "2025", "sscYear": "2023"}]
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_members (id, name, post, photo, description, socials, sort_order, is_visible, created_at) FROM stdin;
1	Motiur Rahman Ahad	Mentor	/objects/uploads/17cf1a2f-3026-492e-9abc-eb6b510ee23f	13th at the admission test of CU (C unit) , 2024-25 2nd Semester, Dept.of Finance, University of Chittagong	\N	0	t	2026-02-09 07:01:12.24405
2	Motiur Rahman Ahad	Mentor	/objects/uploads/bb575177-f918-4f12-a250-557295465fbf	13th at the admission test of CU (C unit) , 2024-25 2nd Semester, Dept.of Finance, University of Chittagong	\N	1	t	2026-02-09 07:02:12.445559
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, full_name, email, whatsapp, role, is_premium, is_restricted, hsc_roll, hsc_reg, hsc_year, hsc_group, hsc_board, ssc_roll, ssc_reg, ssc_year, ssc_group, ssc_board, created_at, is_second_timer) FROM stdin;
1	admin	$2b$10$GoUsVJro3dPmKsEHENFL6eBqLIxhOudDo6Tue8bYUVQrU6QdfKZfO	FCA Admin	samiulzedu@gmail.com	01878438103	admin	t	f	123456	0123456789	2026	Business Studies	Chittagong	123456	0123456789	2024	Business Studies	Chittagong	2026-02-08 20:00:39.099302	f
3	admin2	$2b$10$0wYXIvlWmzVetYVhXG4VDu9IllYmbV/otrVpWXmcOAtVok3mdABVu	admin	samiul.chk@gmail.com	12345678900	moderator	f	f	123456	1234567890	2026	Science	Technical	123456	1234567890	2018	Business Studies	Technical	2026-02-08 20:25:17.867206	f
4	B25121121	$2b$10$euWGdmRmA5N9e4nCCaVb9eN/XBDAyTw6iZ7kI235EjhK2gb5kJFAe	vxcvx	samiulzedu@gmail.com	01878438102	student	t	f	121121	0123456789	2025	Business Studies	Rajshahi	154154	0123456789	2023	Business Studies	Barisal	2026-02-09 06:10:31.957622	f
\.


--
-- Name: classes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.classes_id_seq', 3, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 2, true);


--
-- Name: enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enrollments_id_seq', 4, true);


--
-- Name: hero_banners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hero_banners_id_seq', 1, true);


--
-- Name: mock_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mock_submissions_id_seq', 26, true);


--
-- Name: mock_tests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mock_tests_id_seq', 17, true);


--
-- Name: notices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notices_id_seq', 2, true);


--
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resources_id_seq', 1, true);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 1, true);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.team_members_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: hero_banners hero_banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hero_banners
    ADD CONSTRAINT hero_banners_pkey PRIMARY KEY (id);


--
-- Name: mock_submissions mock_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mock_submissions
    ADD CONSTRAINT mock_submissions_pkey PRIMARY KEY (id);


--
-- Name: mock_tests mock_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mock_tests
    ADD CONSTRAINT mock_tests_pkey PRIMARY KEY (id);


--
-- Name: notices notices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: site_settings site_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_unique UNIQUE (key);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: users users_whatsapp_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_whatsapp_unique UNIQUE (whatsapp);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- PostgreSQL database dump complete
--

\unrestrict EnpapaGFeMAMN4pyk8AjBwQrZbizuhf6yL4ddmVc5c4k6Fsznhh69ZVmhPY7y6p

