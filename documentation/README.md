# Blockchain-Based Electoral Management System

## System Contents
This CD contains the complete Blockchain-Based Electoral Management System (BBEMS) developed for the Independent Electoral and Boundaries Commission of Kenya. The system provides a secure, transparent, and efficient electoral process leveraging blockchain technology.

## CD Contents
1. **Full Source Code** - `/src` directory
   - Frontend (HTML, CSS, JavaScript)
   - Backend (Node.js/Express)
   - Smart Contracts (Solidity)

2. **Compiled/Deployable Version** - `/build` directory
   - Ready-to-deploy application files
   - Compiled smart contracts

3. **Documentation** - `/documentation` directory
   - System Overview
   - User Guide (PDF)
   - Administrator Guide
   - Technical Specifications

4. **Test Scripts** - `/documentation/test_scripts` directory
   - Functional test scripts
   - Security test scripts
   - Performance test scenarios

5. **Presentation Slides** - `/documentation/presentation` directory
   - PowerPoint presentation
   - PDF version of presentation

## System Requirements
- Node.js v14.x or higher
- Truffle Suite v5.x or higher
- MetaMask browser extension
- Modern web browser (Chrome, Firefox, Edge)
- Ethereum-compatible blockchain network (Ganache for local development)
- 8GB RAM minimum, 16GB recommended
- 1GB free disk space

## Quick Start Guide
1. Install dependencies:
   ```
   npm install
   ```

2. Start the local blockchain:
   ```
   npx ganache-cli
   ```

3. Deploy smart contracts:
   ```
   npx truffle migrate
   ```

4. Start the application:
   ```
   npm run start
   ```

5. Access the application:
   Open your browser and navigate to `http://localhost:3000`

## Contact Information
For technical support or inquiries:
- Email: eliudsamwels7@gmail.com
- Phone: +254 705893137

## License
This system is proprietary and is licensed exclusively to the Independent Electoral and Boundaries Commission of Kenya.

© 2025 Independent Electoral and Boundaries Commission of Kenya. All rights reserved.

# BBEMS Documentation

This directory contains comprehensive documentation for the Blockchain-Based Electoral Management System (BBEMS) developed for the Independent Electoral and Boundaries Commission of Kenya.

## Documentation Structure

- `user_guide/` - Instructions for voters using the system
- `admin_guide/` - Instructions for election administrators and officials
- `system_overview/` - Technical architecture and design documentation
- `test_scripts/` - Comprehensive testing methodology and procedures
- `scripts/` - Utilities for working with documentation
- `html_output/` - Generated HTML versions of documentation
- `pdf_output/` - Generated PDF versions of documentation (when available)

## Working with Documentation

### Viewing Documentation

For the best experience, open the HTML versions of documentation:

1. Navigate to the `html_output` directory
2. Open `index.html` in your web browser
3. Use the navigation links to browse all documentation

### Converting Documentation

To convert the markdown documentation to HTML:

1. Navigate to the `scripts` directory
2. Run `.\convert_markdown_to_html.ps1`
3. HTML files will be generated in the `html_output` directory

To convert HTML files to PDF:

1. Open any HTML file in your web browser
2. Click the "Print to PDF" button in the top-right corner
3. Save the PDF in your preferred location

### Editing Documentation

All documentation is written in Markdown format for easy editing:

1. Edit the respective `.md` files in each directory
2. Run the conversion script to update HTML versions
3. For substantial changes, please update the version information

## Documentation Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| User Guide | 1.0 | April 30, 2025 |
| Admin Guide | 1.0 | April 30, 2025 |
| System Overview | 1.0 | April 30, 2025 |
| Test Plan | 1.0 | April 30, 2025 |

## Contact Information

For questions about documentation:

- Email: eliudsamwels7@gmail.com
- Phone: +254 705893137

---

© 2025 Independent Electoral and Boundaries Commission of Kenya. All rights reserved. 