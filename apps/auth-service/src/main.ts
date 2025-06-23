import { express, cors, cookieParser} from "packages/third-party-libs";
import { errorMiddleware } from "packages/error-handler/error-middleware";

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.use(cors({
  origin: ["http://localhost:3000"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}))

app.use(cookieParser())


app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use(errorMiddleware)

const server = app.listen(port, host, () => {
  console.log(`Auth service is running at http://${host}:${port}`);
});

server.on("error", (err) => {
  console.log("Server Error:", err)
})
