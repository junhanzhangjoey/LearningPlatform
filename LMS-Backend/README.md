# LMS-Backend

The **LMS-Backend** powers the Next-Gen Learning Management System, providing a scalable and modular API layer using **Node.js**, **Express**, and **DynamoDB** (via Dynamoose). Authentication and authorization are handled through **Clerk**.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/SJSU-NextGen-LMS/LMS-Backend.git
cd LMS-Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the backend directory:

```env
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NODE_ENV=development
PORT=3001
```

> 🔐 Replace values with your actual Clerk API keys. You can find them in the [Clerk dashboard](https://dashboard.clerk.com/).

### 4. Run the Server

```bash
npm run dev
```

The server will run on `http://localhost:3001`

---

## 🧪 Running Local DynamoDB with Docker

This backend uses DynamoDB (via Dynamoose). To run DynamoDB locally:

### 1. Navigate to the `deployment` folder

```bash
cd deployment
```

### 2. Start DynamoDB Local with Docker Compose

```bash
docker-compose up
```

This will:

* Pull the `amazon/dynamodb-local` image
* Run it on port `8000`
* Mount the local data volume at `./docker/dynamodb`

> Ensure Docker is installed and running before using this command.

---

## 📌 Key Technologies
* **Node.js** / **Express** – backend framework
* **Dynamoose** – DynamoDB modeling
* **Clerk** – Authentication & authorization
* **Docker Compose** – Local DB environment

---

## 📬 Feedback or Issues?

Feel free to open an issue or submit a pull request. Contributions are welcome!
