/**
 * The HitBox Collectibles LLC privacy policy, verbatim, split into blocks so the
 * screen can render it without embedding a wall of JSX.
 *
 * This is **not** mock API data — there is no `/legal` endpoint and the copy is
 * legal text that ships with the build, so it lives here rather than behind a
 * query hook.
 */

import type { LegalDocumentMeta, LegalSection } from '../types/legal'

export const PRIVACY_POLICY_META: LegalDocumentMeta = {
    company: 'HitBox Collectibles LLC',
    title: 'Privacy Policy',
    effectiveDate: 'July 29, 2026',
    lastUpdated: 'July 29, 2026',
}

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
    {
        number: '1',
        title: 'Introduction',
        blocks: [
            {
                kind: 'paragraph',
                text: 'HitBox Collectibles LLC ("HitBox," "we," "our," or "us") recognizes that privacy is fundamental to the trust placed in us by our customers, artists, creators, business partners, and other individuals who interact with our products and services. This Privacy Policy explains how we collect, use, disclose, retain, protect, and otherwise process Personal Information in connection with the operation of our business and the products, software, applications, websites, technologies, and digital experiences that we make available (collectively, the "Services").',
            },
            {
                kind: 'paragraph',
                text: 'Our goal is to provide transparency regarding our information practices while ensuring that Personal Information is processed responsibly, securely, and in accordance with applicable privacy and data protection laws. We are committed to maintaining appropriate administrative, technical, organizational, and physical safeguards designed to protect Personal Information throughout its lifecycle.',
            },
            {
                kind: 'paragraph',
                text: 'By accessing or using the Services, creating an Account, purchasing or claiming a Collectible, communicating with us, participating in promotions or events, or otherwise providing Personal Information, you acknowledge that you have read and understand this Privacy Policy.',
            },
            {
                kind: 'paragraph',
                text: 'If you do not agree with this Privacy Policy, you should discontinue use of the Services.',
            },
        ],
    },
    {
        number: '2',
        title: 'Scope',
        blocks: [
            {
                kind: 'paragraph',
                text: 'This Privacy Policy applies to Personal Information processed by HitBox in connection with the Services, regardless of whether such information is collected online or offline.',
            },
            {
                kind: 'paragraph',
                text: 'The Services include, without limitation, our websites, mobile applications, software platforms, user accounts, connected physical products, NFC-enabled collectibles, digital collections, authentication systems, online storefronts, payment systems, customer support channels, artist and creator portals, business partnership portals, application programming interfaces (APIs), promotional campaigns, newsletters, events, social media interactions, cloud-based services, and any current or future products, technologies, or services owned, operated, licensed, or otherwise provided by HitBox.',
            },
            {
                kind: 'paragraph',
                text: 'This Privacy Policy also applies to Personal Information collected through communications with our employees, representatives, contractors, affiliates, subsidiaries, service providers, and authorized business partners acting on our behalf.',
            },
            {
                kind: 'paragraph',
                text: 'This Privacy Policy does not apply to products, services, websites, applications, or platforms owned or operated by independent third parties, even where such services are accessible through links, integrations, or other features made available through the Services. Those third parties maintain their own privacy practices, and we encourage you to review their privacy policies before providing them with Personal Information.',
            },
        ],
    },
    {
        number: '3',
        title: 'Definitions',
        blocks: [
            {
                kind: 'paragraph',
                text: 'For purposes of this Privacy Policy, the following terms have the meanings set forth below.',
            },
            {
                kind: 'paragraph',
                text: '"Account" means a registered user account that enables access to certain features or functionality of the Services.',
            },
            {
                kind: 'paragraph',
                text: '"Collectible" means any physical or digital collectible, merchandise, media, artwork, promotional item, authenticated product, NFC-enabled product, serialized item, digital asset, or other product distributed, licensed, sold, or otherwise made available through the Services.',
            },
            {
                kind: 'paragraph',
                text: '"Personal Information" means information that identifies, relates to, describes, references, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, with an identified or identifiable individual. Where required by applicable law, Personal Information includes "Personal Data" or any equivalent legal term recognized within the applicable jurisdiction.',
            },
            {
                kind: 'paragraph',
                text: '"Processing" means any operation performed on Personal Information, including its collection, recording, organization, storage, use, analysis, disclosure, transfer, retrieval, consultation, combination, restriction, deletion, destruction, anonymization, or any other handling of such information.',
            },
            {
                kind: 'paragraph',
                text: '"Services" means all products, software, websites, mobile applications, connected technologies, digital experiences, APIs, marketplaces, communications, and related offerings owned, operated, licensed, or otherwise provided by HitBox.',
            },
        ],
    },
    {
        number: '4',
        title: 'Information We Collect',
        blocks: [
            {
                kind: 'paragraph',
                text: 'The categories of Personal Information we collect depend upon how you interact with the Services, the products you use, the transactions you conduct, and the choices you make while using our platform.',
            },
            { kind: 'subheading', text: 'Information You Provide' },
            {
                kind: 'paragraph',
                text: 'We collect Personal Information that you voluntarily provide when creating an Account, purchasing products, claiming or authenticating Collectibles, communicating with customer support, subscribing to newsletters, joining a waitlist, participating in promotions or surveys, submitting artist or partnership applications, applying for employment, attending events, or otherwise interacting with the Services.',
            },
            {
                kind: 'paragraph',
                text: 'Depending on the nature of your interaction with us, this information may include your name, username, display name, email address, telephone number, mailing address, shipping address, billing address, payment-related information, profile information, communication preferences, purchase history, account credentials, and any other information you choose to provide.',
            },
            { kind: 'subheading', text: 'Information Collected Automatically' },
            {
                kind: 'paragraph',
                text: 'When you access or use the Services, certain information is generated automatically through your browser, device, or interaction with the platform.',
            },
            {
                kind: 'paragraph',
                text: 'This information may include your Internet Protocol (IP) address, browser type and version, operating system, device identifiers, language preferences, approximate geographic location derived from your IP address, referral information, pages viewed, interaction history, clickstream data, timestamps, session duration, diagnostic information, crash reports, and other technical information relating to the operation, security, and performance of the Services.',
            },
            { kind: 'subheading', text: 'Information Related to Connected Collectibles' },
            {
                kind: 'paragraph',
                text: 'Our platform incorporates connected physical products and digital experiences that may utilize NFC technology, serialized identifiers, authentication technologies, secure identifiers, or similar technologies.',
            },
            {
                kind: 'paragraph',
                text: 'When a Collectible is scanned, authenticated, activated, claimed, transferred, or otherwise interacts with the Services, we may collect information relating to the Collectible, including its unique identifier, authentication status, activation history, ownership records maintained through the Services, scan history, reward eligibility, associated digital content, technical metadata, and other information reasonably necessary to authenticate products, prevent fraud, administer ownership records, deliver digital experiences, and operate the connected ecosystem.',
            },
            { kind: 'subheading', text: 'Information Received from Third Parties' },
            {
                kind: 'paragraph',
                text: 'We may receive Personal Information from payment processors, authentication providers, logistics providers, analytics providers, cloud service providers, marketing partners, business partners, publicly available sources, social media platforms, identity verification providers, and other third parties where permitted by applicable law.',
            },
            {
                kind: 'paragraph',
                text: 'Where appropriate, we may combine information obtained from multiple sources in order to improve the accuracy, security, functionality, and overall operation of the Services.',
            },
        ],
    },
    {
        number: '5',
        title: 'How We Use Personal Information',
        blocks: [
            {
                kind: 'paragraph',
                text: 'We use Personal Information to operate, maintain, secure, improve, and expand the Services, fulfill our contractual obligations, comply with applicable legal requirements, protect the integrity of our platform, and support our legitimate business interests. The manner in which Personal Information is used depends upon the nature of your relationship with HitBox, the Services you use, and the choices you make while interacting with our platform.',
            },
            {
                kind: 'paragraph',
                text: 'Among other purposes described in this Privacy Policy, we use Personal Information to create and administer Accounts; authenticate users; verify identity; process purchases and payments; fulfill orders; coordinate shipping and delivery; provide customer support; administer promotions, contests, surveys, and events; communicate with users regarding products, services, transactions, security matters, and updates to the Services; evaluate artist, creator, employment, and business partnership submissions; personalize user experiences; administer digital collections; authenticate connected Collectibles; facilitate ownership records maintained through the Services; deliver digital content, rewards, and other platform functionality; improve existing products and develop new technologies; conduct analytics and performance monitoring; identify bugs and technical issues; detect, investigate, and prevent fraud, abuse, unauthorized access, intellectual property infringement, or other unlawful activity; protect the safety, security, and integrity of our Services; enforce our agreements and policies; establish, exercise, or defend legal claims; comply with legal, regulatory, accounting, tax, auditing, and reporting obligations; and otherwise operate our business in a lawful and commercially reasonable manner.',
            },
            {
                kind: 'paragraph',
                text: 'We may also use Personal Information to create aggregated, anonymized, or de-identified information that no longer identifies or can reasonably be associated with an individual. Such information is not considered Personal Information once it has been de-identified in accordance with applicable law and may be used for any lawful business purpose, including research, analytics, product development, operational reporting, security improvements, forecasting, and business planning.',
            },
            {
                kind: 'paragraph',
                text: 'We will not use Personal Information for purposes that are materially inconsistent with this Privacy Policy without providing any notice or obtaining any consent required under applicable law.',
            },
        ],
    },
    {
        number: '6',
        title: 'Legal Bases for Processing',
        blocks: [
            {
                kind: 'paragraph',
                text: 'Where applicable privacy laws require us to identify a legal basis for Processing Personal Information, we rely on one or more of the following grounds.',
            },
            {
                kind: 'paragraph',
                text: 'Processing may be necessary to perform a contract with you or to take steps at your request before entering into a contractual relationship, including creating Accounts, processing transactions, fulfilling purchases, authenticating Collectibles, delivering digital content, and providing the Services you request.',
            },
            {
                kind: 'paragraph',
                text: 'Processing may be necessary to comply with legal obligations imposed upon HitBox, including obligations relating to taxation, accounting, financial reporting, consumer protection, fraud prevention, intellectual property enforcement, cybersecurity, law enforcement requests, judicial proceedings, governmental investigations, regulatory compliance, and other legal requirements.',
            },
            {
                kind: 'paragraph',
                text: 'Processing may also be necessary to pursue our legitimate business interests, provided those interests are not overridden by your rights and freedoms under applicable law. These interests include operating, maintaining, securing, improving, and expanding the Services; protecting our users, personnel, business partners, and assets; developing new products and technologies; conducting research and analytics; preventing fraud; enforcing our agreements; and supporting the ordinary operation of our business.',
            },
            {
                kind: 'paragraph',
                text: 'Where required by applicable law, we will obtain your consent before Processing Personal Information for specific purposes. You may withdraw consent at any time using the methods made available through the Services or by contacting us using the information provided in this Privacy Policy. Withdrawal of consent will not affect the lawfulness of any Processing that occurred before such withdrawal.',
            },
            {
                kind: 'paragraph',
                text: 'In limited circumstances, we may also Process Personal Information where necessary to protect the vital interests of an individual or where otherwise authorized or required by applicable law.',
            },
        ],
    },
    {
        number: '7',
        title: 'Cookies and Similar Technologies',
        blocks: [
            {
                kind: 'paragraph',
                text: 'Like many technology companies, HitBox uses cookies and similar technologies to support the operation, security, functionality, and performance of the Services.',
            },
            {
                kind: 'paragraph',
                text: 'Cookies are small text files that are stored on your device when you visit a website. We also use technologies such as web beacons, pixels, tags, software development kits (SDKs), local storage, session storage, APIs, server logs, and similar technologies that perform comparable functions across our websites, mobile applications, and connected services.',
            },
            {
                kind: 'paragraph',
                text: 'These technologies help us authenticate users, maintain secure sessions, remember preferences, operate shopping functionality, process payments, prevent fraud, understand how the Services are used, diagnose technical issues, analyze performance, personalize user experiences, evaluate the effectiveness of communications, and improve our products and services.',
            },
            {
                kind: 'paragraph',
                text: 'The information collected through these technologies may include your IP address, browser characteristics, device identifiers, operating system, language preferences, approximate geographic location, pages visited, referring websites, clickstream information, session activity, timestamps, performance metrics, and diagnostic information.',
            },
            {
                kind: 'paragraph',
                text: 'Some cookies remain active only while your browser session is open, while others remain stored on your device for a longer period in order to remember preferences or support recurring functionality. Retention periods vary depending upon the purpose served by the applicable technology.',
            },
            {
                kind: 'paragraph',
                text: 'You may control or disable cookies through your browser settings or other available device controls. Please note, however, that disabling certain cookies or similar technologies may affect the functionality, security, availability, or performance of portions of the Services.',
            },
            {
                kind: 'paragraph',
                text: 'Where required by applicable law, we will obtain your consent before deploying cookies or similar technologies that are not strictly necessary for the operation of the Services.',
            },
        ],
    },
    {
        number: '8',
        title: 'Analytics, Advertising, and Artificial Intelligence',
        blocks: [
            {
                kind: 'paragraph',
                text: 'We use analytics tools and related technologies to better understand how the Services are used, identify technical issues, improve system performance, measure engagement, evaluate product effectiveness, and support future development.',
            },
            {
                kind: 'paragraph',
                text: 'We may also use advertising, attribution, and measurement technologies to evaluate marketing campaigns, understand audience engagement, prevent advertising fraud, measure conversions, and improve communications with existing and prospective users in accordance with applicable law.',
            },
            {
                kind: 'paragraph',
                text: 'As our platform evolves, certain features of the Services may incorporate artificial intelligence, machine learning, automation, recommendation systems, fraud detection technologies, predictive analytics, natural language processing, computer vision, or similar technologies designed to improve functionality, security, personalization, customer support, moderation, content discovery, authentication, operational efficiency, or user experience.',
            },
            {
                kind: 'paragraph',
                text: 'Where Personal Information is used in connection with such technologies, we will do so in accordance with this Privacy Policy and applicable law. Where legally required, we will provide any additional disclosures or obtain any necessary consent before Processing Personal Information for such purposes.',
            },
            {
                kind: 'paragraph',
                text: 'We do not use automated decision-making in a manner that produces legal or similarly significant effects on individuals except where permitted by applicable law or with appropriate safeguards where required.',
            },
        ],
    },
    {
        number: '9',
        title: 'How We Share Personal Information',
        blocks: [
            {
                kind: 'paragraph',
                text: 'We do not sell your Personal Information for monetary consideration. We also do not disclose Personal Information to third parties for their own independent marketing purposes except where you have expressly directed us to do so or where such disclosure is otherwise permitted or required by applicable law.',
            },
            {
                kind: 'paragraph',
                text: 'In the ordinary course of operating our business, however, Personal Information may be shared with carefully selected third parties that perform services on our behalf or assist us in providing the Services. These recipients may include payment processors, cloud hosting providers, data storage providers, authentication providers, cybersecurity providers, fraud prevention providers, shipping and logistics providers, customer support providers, communications providers, analytics providers, infrastructure providers, software vendors, professional advisors, auditors, accountants, insurers, financial institutions, marketing service providers, and other vendors engaged to support our business operations.',
            },
            {
                kind: 'paragraph',
                text: 'Where we engage third-party service providers to Process Personal Information on our behalf, we require them to Process such information only for authorized purposes, to maintain appropriate safeguards designed to protect Personal Information, and to comply with applicable legal obligations governing the confidentiality and security of the information entrusted to them.',
            },
            {
                kind: 'paragraph',
                text: 'We may also disclose Personal Information where we believe, in good faith, that disclosure is necessary to comply with applicable law; respond to lawful requests from courts, regulators, governmental authorities, or law enforcement agencies; protect the rights, property, safety, or security of HitBox, our users, or others; investigate suspected fraud, security incidents, intellectual property infringement, violations of our Terms of Use, or other unlawful conduct; enforce contractual rights; establish, exercise, or defend legal claims; or otherwise protect our legitimate business interests.',
            },
            {
                kind: 'paragraph',
                text: 'Should you choose to interact with third-party services through integrations or other features made available within the Services, certain information may be shared with those third parties as necessary to facilitate the requested functionality. Any information subsequently collected by those third parties will be governed by their own privacy policies and practices.',
            },
        ],
    },
    {
        number: '10',
        title: 'International Data Transfers',
        blocks: [
            {
                kind: 'paragraph',
                text: 'HitBox is headquartered in the United States but operates with users, partners, service providers, and infrastructure located in multiple jurisdictions. As a result, Personal Information may be transferred to, stored in, or otherwise Processed in countries other than the country in which it was originally collected.',
            },
            {
                kind: 'paragraph',
                text: 'The privacy and data protection laws applicable within those jurisdictions may differ from those of your country or region of residence. Nevertheless, we take reasonable measures designed to ensure that Personal Information continues to receive an appropriate level of protection consistent with this Privacy Policy and applicable law.',
            },
            {
                kind: 'paragraph',
                text: 'Where required by applicable law, international transfers of Personal Information will be supported by legally recognized transfer mechanisms, including contractual safeguards or other approved mechanisms intended to provide appropriate protections for cross-border transfers.',
            },
            {
                kind: 'paragraph',
                text: 'By using the Services or otherwise providing Personal Information to HitBox, you acknowledge that your information may be transferred to and Processed in jurisdictions outside your country of residence to the extent permitted by applicable law.',
            },
        ],
    },
    {
        number: '11',
        title: 'Data Retention',
        blocks: [
            {
                kind: 'paragraph',
                text: 'We retain Personal Information only for as long as reasonably necessary to fulfill the purposes described in this Privacy Policy, provide the Services, satisfy contractual commitments, comply with legal and regulatory obligations, resolve disputes, maintain appropriate business and financial records, enforce our agreements, detect and prevent fraud, preserve the integrity and security of our systems, and establish, exercise, or defend legal claims.',
            },
            {
                kind: 'paragraph',
                text: 'The length of time for which Personal Information is retained varies depending upon the nature of the information, the purposes for which it was collected, applicable legal requirements, operational needs, contractual obligations, applicable statutes of limitation, and other relevant considerations.',
            },
            {
                kind: 'paragraph',
                text: 'When Personal Information is no longer required for the purposes for which it was collected, we will securely delete, anonymize, aggregate, or otherwise dispose of the information in accordance with applicable law and our internal record retention practices, unless continued retention is required or authorized by law.',
            },
        ],
    },
    {
        number: '12',
        title: 'Information Security',
        blocks: [
            {
                kind: 'paragraph',
                text: 'Protecting Personal Information is an important part of our business operations. We maintain a comprehensive information security program that is designed to safeguard Personal Information throughout its lifecycle using administrative, technical, organizational, and physical security measures appropriate to the nature of the information and the risks associated with its Processing.',
            },
            {
                kind: 'paragraph',
                text: 'Our security measures may include access controls, role-based permissions, authentication mechanisms, encryption technologies where appropriate, network monitoring, vulnerability assessments, penetration testing, logging and audit controls, secure software development practices, vendor risk management, employee training, incident response procedures, disaster recovery planning, business continuity measures, and periodic reviews of our security program.',
            },
            {
                kind: 'paragraph',
                text: 'Access to Personal Information is limited to personnel, contractors, and authorized service providers who require such access to perform legitimate business responsibilities and who are subject to appropriate confidentiality obligations.',
            },
            {
                kind: 'paragraph',
                text: 'Although we continually work to protect Personal Information using commercially reasonable safeguards and industry-recognized security practices, no method of electronic transmission, storage, or information security can be guaranteed to be completely secure. Accordingly, while we strive to protect Personal Information, we cannot guarantee or warrant that unauthorized access, disclosure, alteration, destruction, or other security events will never occur. Users should also take appropriate measures to safeguard their own Accounts, passwords, devices, and other credentials used to access the Services.',
            },
        ],
    },
    {
        number: '13',
        title: 'Security Incidents',
        blocks: [
            {
                kind: 'paragraph',
                text: 'HitBox maintains policies and procedures designed to identify, investigate, contain, mitigate, document, and respond to actual or suspected security incidents affecting the confidentiality, integrity, or availability of Personal Information or the Services.',
            },
            {
                kind: 'paragraph',
                text: 'If we determine that Personal Information has been accessed, acquired, disclosed, altered, or destroyed in an unauthorized manner, we will investigate the incident, take appropriate measures to reduce the likelihood of further harm, and provide notifications to affected individuals, regulators, or governmental authorities where required by applicable law.',
            },
            {
                kind: 'paragraph',
                text: 'Nothing contained in this Privacy Policy shall be interpreted as an admission regarding the scope, significance, cause, or legal consequences of any particular security incident, nor shall it create any obligation to provide notice beyond those imposed by applicable law.',
            },
        ],
    },
    {
        number: '14',
        title: 'Your Privacy Rights',
        blocks: [
            {
                kind: 'paragraph',
                text: 'Depending upon your jurisdiction of residence and the laws applicable to the Processing of your Personal Information, you may have certain rights regarding the information we maintain about you. These rights are not absolute and may be subject to legal limitations, exceptions, verification requirements, or other conditions established by applicable law.',
            },
            {
                kind: 'paragraph',
                text: 'Subject to applicable law, you may have the right to request access to the Personal Information we maintain about you, request correction of inaccurate or incomplete Personal Information, request deletion of Personal Information, request restriction of certain Processing activities, object to certain Processing, request the portability of Personal Information in a structured and commonly used format where technically feasible, withdraw consent where Processing is based upon consent, request information regarding our privacy practices, appeal certain privacy-related decisions, or exercise any additional rights provided under applicable law.',
            },
            {
                kind: 'paragraph',
                text: "To protect the privacy and security of our users, we may require reasonable verification of your identity before responding to a privacy request. Where a request is submitted by an authorized agent or other representative, we may require documentation demonstrating the individual's authority to act on behalf of the applicable person.",
            },
            {
                kind: 'paragraph',
                text: 'We will respond to verified requests within the time periods required by applicable law. In certain circumstances, we may decline a request where permitted by law, including where compliance would interfere with legal obligations, compromise the privacy rights of another individual, reveal confidential business information or trade secrets, prevent us from completing a transaction requested by you, or otherwise fall within a recognized legal exception.',
            },
            {
                kind: 'paragraph',
                text: 'Exercising your privacy rights will not result in unlawful discrimination. We will not deny products or services, charge different prices, provide a different level or quality of service, or otherwise discriminate against you solely because you exercised a privacy right, except where differential treatment is expressly permitted by applicable law.',
            },
        ],
    },
    {
        number: '15',
        title: 'Additional Rights Under Applicable Privacy Laws',
        blocks: [
            {
                kind: 'paragraph',
                text: 'Individuals residing in certain jurisdictions may be entitled to additional protections under applicable privacy legislation, including, where applicable, the European Union General Data Protection Regulation ("GDPR"), the United Kingdom General Data Protection Regulation ("UK GDPR"), the Swiss Federal Act on Data Protection ("FADP"), the California Consumer Privacy Act, as amended by the California Privacy Rights Act ("CCPA"), and other applicable United States state privacy laws.',
            },
            {
                kind: 'paragraph',
                text: 'Where these laws apply, HitBox will Process Personal Information in accordance with the rights, obligations, and safeguards required by the applicable legislation. This may include honoring requests relating to access, correction, deletion, portability, objection, restriction of Processing, withdrawal of consent, appeals, or the use of recognized universal opt-out mechanisms where legally required.',
            },
            {
                kind: 'paragraph',
                text: 'Nothing in this Privacy Policy is intended to limit or waive any rights that cannot lawfully be limited or waived under applicable privacy legislation. If any provision of this Privacy Policy conflicts with a mandatory legal requirement applicable to your Personal Information, the applicable legal requirement shall govern to the extent of the conflict.',
            },
        ],
    },
    {
        number: '16',
        title: "Children's Privacy",
        blocks: [
            {
                kind: 'paragraph',
                text: 'The Services are intended for a general audience and are not directed to children under the age at which independent consent for the Processing of Personal Information is recognized under applicable law.',
            },
            {
                kind: 'paragraph',
                text: 'HitBox does not knowingly collect Personal Information directly from children in violation of applicable law. If we become aware that Personal Information has been collected from a child where such collection is prohibited, we will take reasonable steps to investigate the matter and, where appropriate, delete or otherwise appropriately Process the information in accordance with applicable legal requirements.',
            },
            {
                kind: 'paragraph',
                text: 'Parents or legal guardians who believe that a child has provided Personal Information to HitBox in violation of this Privacy Policy may contact us using the information provided below so that appropriate action may be taken.',
            },
        ],
    },
    {
        number: '17',
        title: 'Third-Party Services',
        blocks: [
            {
                kind: 'paragraph',
                text: 'The Services may contain links to, integrate with, or otherwise facilitate access to products, applications, websites, payment platforms, social media services, authentication providers, cloud services, marketplaces, communications platforms, logistics providers, or other services operated by independent third parties.',
            },
            {
                kind: 'paragraph',
                text: 'These third-party services are governed by their own terms, conditions, and privacy practices. HitBox does not own or control the operation of independent third-party services and is not responsible for the privacy, security, or data handling practices of those third parties.',
            },
            {
                kind: 'paragraph',
                text: 'Your interactions with any third-party service are governed exclusively by the policies and agreements applicable to that service. We encourage you to carefully review the privacy policies of any third party before providing Personal Information or otherwise engaging with its products or services.',
            },
        ],
    },
    {
        number: '18',
        title: 'Business Transactions',
        blocks: [
            {
                kind: 'paragraph',
                text: 'As HitBox continues to grow, our corporate structure and business operations may evolve. Accordingly, Personal Information may be disclosed, transferred, or otherwise made available as part of any actual or proposed merger, acquisition, investment, financing, restructuring, reorganization, joint venture, sale of assets, bankruptcy proceeding, change in ownership, or other corporate transaction involving all or a portion of our business.',
            },
            {
                kind: 'paragraph',
                text: 'Where Personal Information is transferred as part of such a transaction, we will take reasonable measures to ensure that the recipient is permitted to Process the information in a manner consistent with this Privacy Policy or as otherwise permitted by applicable law.',
            },
        ],
    },
    {
        number: '19',
        title: 'Changes to This Privacy Policy',
        blocks: [
            {
                kind: 'paragraph',
                text: 'We may modify or update this Privacy Policy from time to time to reflect changes in our business operations, technologies, products, Services, legal obligations, regulatory requirements, industry practices, or other legitimate business considerations.',
            },
            {
                kind: 'paragraph',
                text: 'When material changes are made, we will provide notice in a manner consistent with applicable law. Depending upon the nature of the changes, notice may be provided through the Services, by email, through your Account, or by another method reasonably calculated to inform affected users.',
            },
            {
                kind: 'paragraph',
                text: 'The "Last Updated" date appearing at the beginning of this Privacy Policy indicates the date on which the current version became effective. Your continued use of the Services following the effective date of a revised Privacy Policy constitutes your acknowledgment of the updated Privacy Policy to the extent permitted by applicable law.',
            },
        ],
    },
    {
        number: '20',
        title: 'Contact Us',
        blocks: [
            {
                kind: 'paragraph',
                text: 'If you have questions regarding this Privacy Policy, wish to exercise your privacy rights, or would like to contact us regarding our privacy practices, you may do so using the contact information below:',
            },
            { kind: 'contact', label: 'Company', value: 'HitBox Collectibles LLC' },
            { kind: 'contact', label: 'Attention', value: 'Privacy Officer' },
            {
                kind: 'contact',
                label: 'Email',
                value: 'hitboxcollectibles.admin@gmail.com',
                href: 'mailto:hitboxcollectibles.admin@gmail.com',
            },
            {
                kind: 'contact',
                label: 'Website',
                value: 'https://www.hitboxcollectibles.com',
                href: 'https://www.hitboxcollectibles.com',
            },
            {
                kind: 'paragraph',
                text: 'We will make commercially reasonable efforts to respond to privacy-related inquiries and verified requests within the timeframes required by applicable law.',
            },
        ],
    },
]
