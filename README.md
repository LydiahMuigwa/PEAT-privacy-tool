# PEAT — Privacy Exposure Analysis Tool

**PEAT** is an advanced cybersecurity reconnaissance tool that combines powerful OSINT capabilities with AI-driven analysis to help individuals and organizations understand their digital exposure and privacy risks.

Built for cybersecurity professionals, privacy advocates, and anyone who wants to **take control of their online footprint** and **boost cybersecurity awareness**.

---

## 🔍 Core Features

### **OSINT Reconnaissance**
- **Username Intelligence** — Powered by Sherlock to discover social media profiles across 400+ platforms
- **Email Exposure Analysis** — Holehe integration to identify data breaches and account exposures
- **Digital Footprint Mapping** — Comprehensive view of your online presence

### **AI-Powered Analysis** 
- **Smart Attack Simulations** — See how attackers could exploit your exposed information
- **GPT-4 Threat Explanations** — Understand attack vectors and social engineering tactics
- **Personalized Risk Assessment** — Tailored recommendations based on your exposure profile

### **Professional Reporting**
- **Comprehensive PDF Reports** — Professional documentation of findings
- **Risk Visualization** — Interactive charts and exposure metrics
- **Cache Intelligence** — Fast, efficient scanning with intelligent result caching
- **Rate-Limited API** — Enterprise-grade security and performance controls

### **Privacy Education**
- **Interactive Red Flag Training** — Learn to spot phishing and social engineering
- **Personalized Learning Paths** — Education tailored to your specific risks
- **Downloadable Privacy Guides** — Take-action resources for immediate protection

---

## 🛠️ Tech Stack

### **Backend Architecture**
- **Node.js** with Express framework
- **Python Integration** — Sherlock & Holehe OSINT tools
- **MongoDB** for intelligent caching and data persistence
- **OpenAI API** for threat analysis and explanations
- **Advanced Rate Limiting** and security middleware

### **Frontend Experience**
- **Vue.js 3** with Composition API
- **Vite** for lightning-fast development
- **Tailwind CSS** for modern, responsive design
- **Chart.js** for data visualization
- **Interactive Components** for enhanced user experience

### **Security & Performance**
- **CORS Protection** with configurable origins
- **Multi-tier Rate Limiting** (General, Scan, PDF, AI)
- **Input Validation** and sanitization
- **Graceful Error Handling** without data exposure
- **Health Monitoring** and system diagnostics

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- **Python 3.8+** 
- **MongoDB** (local or cloud)
- **OpenAI API Key**
- **HIBP API Key** (optional)
- **SERPAPI Key** (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/PEAT-scanner.git
   cd PEAT-scanner
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database connection
   ```

5. **Start the application:**
   ```bash
   # Start backend server
   npm run dev

   # In another terminal, start frontend
   cd frontend
   npm run dev
   ```

6. **Access PEAT:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`
   - Health Check: `http://localhost:3000/health`

---

## ⚙️ Configuration

### Environment Variables
```bash
# Database Configuration
MONGO_URI=mongodb://localhost:27017/peat

# API Keys
OPENAI_API_KEY=sk-your-openai-api-key
SERPAPI_KEY=your-serpapi-key
HIBP_API_KEY=your-hibp-api-key

# Server Configuration  
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Security Settings
RATE_LIMIT_ENABLED=true
LOG_LEVEL=info
```

---

## 📁 Project Structure

```
PEAT/
├── backend/
│   ├── routes/
│   │   ├── scan.js          # Sherlock/Holehe endpoints
│   │   └── report.js        # PDF generation
│   ├── utils/
│   │   ├── explainAttack.js # AI-powered analysis
│   │   ├── mongo.js         # Database connection
│   │   ├── exposureService.js # Caching layer
│   │   └── errorHandler.js  # Error management
│   ├── scripts/
│   │   ├── sherlock_runner.py
│   │   ├── holehe_runner.py
│   │   └── footprint_scraper.py
│   └── middleware/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footprint.vue
│   │   │   ├── LandingPage.vue
│   │   │   └── App.vue
│   │   ├── views/
│   │   ├── router/
│   │   └── services/
├── server.js                # Main application server
├── package.json            # Node.js dependencies
├── requirements.txt        # Python dependencies
├── railway.json           # Railway deployment config
└── README.md
```

---

## 🌐 API Endpoints

### **Core Endpoints**
- `GET /health` — System health and diagnostics
- `GET /api/info` — API documentation and rate limits
- `GET /api/cache-stats` — Cache performance metrics

### **Scanning Endpoints**
- `POST /api/scan` — Execute Sherlock/Holehe scans
- `GET /api/scan/quick` — Fast cached results lookup

### **Analysis Endpoints**
- `POST /api/explain-attack` — AI-powered threat analysis
- `POST /api/scrape` — Profile information extraction
- `POST /api/log-scan` — Scan activity logging

### **Reporting Endpoints**
- `POST /api/report/pdf` — Generate comprehensive PDF reports

---

## 🔒 Security Features

- **Multi-tier Rate Limiting**: Different limits for general API, scans, PDF generation, and AI analysis
- **CORS Protection**: Configurable origin validation for production deployment
- **Input Sanitization**: Comprehensive validation and sanitization of all inputs
- **Error Isolation**: Secure error handling that doesn't expose sensitive information
- **Health Monitoring**: Real-time system diagnostics and database connectivity checks
- **Graceful Shutdown**: Proper resource cleanup and database connection management

---

## 🚀 Deployment

### **Production Deployment**
- **Backend**: Railway.app with MongoDB integration
- **Frontend**: Vercel with global CDN
- **Database**: Railway MongoDB or MongoDB Atlas
- **Monitoring**: Built-in health checks and logging

### **Environment Setup**
1. **Railway Backend**: Automatic deployment from GitHub
2. **Vercel Frontend**: Optimized Vue.js build with environment variables
3. **Database**: Managed MongoDB with connection pooling
4. **APIs**: Secure key management through environment variables

---

## 🗺️ Roadmap

### **Phase 1: Core Enhancement**
- Enhanced Sherlock and Holehe integration
- Advanced caching and performance optimization
- Comprehensive PDF reporting system

### **Phase 2: Intelligence Expansion**
- Additional OSINT tool integrations
- Social media platform expansion
- Advanced data correlation algorithms

### **Phase 3: Enterprise Features**
- Multi-user dashboard and team management
- Historical scan tracking and trend analysis
- Custom threat intelligence feeds
- White-label deployment options

### **Phase 4: Advanced Analytics**
- Machine learning risk scoring
- Automated threat monitoring
- Integration with SIEM platforms
- Global threat intelligence sharing

---

## 🤝 Contributing

We welcome contributions from the cybersecurity community!

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Submit a pull request**

### **Contribution Guidelines**
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure security best practices

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

**PEAT** is designed for educational purposes and authorized security testing only. Users are responsible for:
- Obtaining proper authorization before scanning any targets
- Complying with applicable laws and regulations
- Using the tool ethically and responsibly
- Respecting privacy and data protection requirements

---

## 📞 Support

- **Issues**: Create a GitHub issue for bugs or feature requests
- **Documentation**: Visit `/api/info` endpoint for detailed API documentation
- **Community**: Join discussions in GitHub Discussions
- **Security**: Report security vulnerabilities responsibly

---

> **PEAT** empowers cybersecurity professionals and privacy-conscious individuals to transform from passive digital citizens to **proactive privacy defenders** through intelligence-driven awareness and education.