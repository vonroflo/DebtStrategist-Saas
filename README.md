# Debt Strategist - Smart Payoff Planning

A paycheck-aware debt payoff application that provides personalized strategies to help users become debt-free faster while minimizing interest payments.

## Features

### Core Functionality
- **Smart Debt Management**: Add debts manually or import from PDF statements
- **Multiple Payoff Strategies**: Avalanche (highest interest first), Snowball (smallest balance first), and Custom priority
- **Paycheck-Aware Planning**: Works with weekly, bi-weekly, or monthly pay schedules
- **Next Move Guidance**: Clear recommendations for each paycheck
- **Progress Tracking**: Visual charts and progress indicators
- **Interest Savings Calculator**: See how much you'll save vs. minimum payments

### PDF Import Feature
- Upload credit card statements, loan documents, or mortgage statements
- AI-powered extraction of debt information including:
  - Account name and type
  - Current balance
  - APR/interest rate
  - Minimum payment amount
  - Due date
- Smart confidence scoring for extraction accuracy
- Manual review and editing before adding to debt list

### Advanced Features
- **Interactive Charts**: Visualize debt payoff timeline and interest savings
- **Scenario Planning**: Test different payment amounts and strategies
- **Detailed Schedules**: See payment-by-payment breakdown
- **Export Options**: CSV and PDF export capabilities
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 13+ with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Charts**: Recharts for data visualization
- **PDF Processing**: pdf-parse for text extraction
- **AI Integration**: OpenAI/Claude API for intelligent data extraction
- **Validation**: Zod for type-safe form validation
- **Date Handling**: date-fns for date calculations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd debt-strategist
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding Debts

**Manual Entry:**
1. Click "Add Manually" in the debt table
2. Fill in debt details (name, balance, APR, minimum payment)
3. Select debt type and due date
4. Save to add to your debt list

**PDF Import:**
1. Click "Import PDF" in the debt table
2. Upload a PDF statement (credit card, loan, etc.)
3. Review the AI-extracted information
4. Confirm to add the debt to your list

### Creating Your Payoff Plan

1. **Choose Strategy**: Select Avalanche, Snowball, or Custom priority
2. **Set Paycheck Details**: Enter your extra payment amount and pay frequency
3. **Review Next Move**: See exactly what to pay on your next paycheck
4. **Track Progress**: Monitor your debt-free journey with charts and metrics

### Understanding Strategies

- **Avalanche**: Pay minimums on all debts, then attack the highest APR debt first. Saves the most money in interest.
- **Snowball**: Pay minimums on all debts, then attack the smallest balance first. Provides psychological wins and momentum.
- **Custom**: Set your own priority order based on personal preferences.

## API Endpoints

- `POST /api/extract-pdf` - Extract debt information from uploaded PDF
- `POST /api/plan/compute` - Generate payoff plan and next move recommendations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Compliance & Disclaimers

This application provides educational guidance only and is not financial advice. All calculations are estimates based on user inputs. Interest calculations assume consistent payment behavior and no prepayment penalties. Users should consult with qualified financial advisors for personalized advice.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact [support@debtstrategist.com](mailto:support@debtstrategist.com).