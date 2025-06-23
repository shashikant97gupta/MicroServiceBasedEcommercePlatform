import { express, cors, rateLimit, morgan, cookieParser,
   swaggerUi, axios, proxy } from "../../../packages/third-party-libs";

const app = express();

app.use(cors({
  origin: ["http://localhost:3000"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}))

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb"}));
app.use(express.urlencoded({limit: "100mb", extended: true}));
app.use(cookieParser());
app.set("trust proxy", 1)

// Api rate limiting logic

const limiter = rateLimit({
  windowMs: 15*60*1000, // 15 mins
  max:(req: any) => (req.user ? 1000 : 100), // if user is logged in then allow 1000 requests else only 100
  message: {error: "Too many requests, please try again later!"},
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => req.ip,
});

app.use(limiter);


app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use("/", proxy("http://localhost:6001")); 


const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
