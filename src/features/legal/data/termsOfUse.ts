/**
 * The HitBox Collectibles LLC terms of use, verbatim, split into blocks so the
 * screen can render it without embedding a wall of JSX.
 *
 * Static legal copy that ships with the build — see the note in
 * `privacyPolicy.ts`; there is no `/legal` endpoint behind this.
 */

import type { LegalDocumentMeta, LegalSection } from '../types/legal'

export const TERMS_OF_USE_META: LegalDocumentMeta = {
    company: 'HitBox Collectibles LLC',
    title: 'Terms of Use',
    effectiveDate: 'July 29, 2026',
    lastUpdated: 'July 29, 2026',
    preamble: [
        'PLEASE READ THESE TERMS OF USE CAREFULLY. THESE TERMS CONSTITUTE A LEGALLY BINDING AGREEMENT BETWEEN YOU AND HITBOX COLLECTIBLES LLC REGARDING YOUR ACCESS TO AND USE OF THE SERVICES.',
        'BY ACCESSING OR USING THE SERVICES, CREATING AN ACCOUNT, PURCHASING, CLAIMING, REGISTERING, SCANNING, AUTHENTICATING, TRANSFERRING, OR OTHERWISE INTERACTING WITH ANY COLLECTIBLE, DIGITAL CONTENT, OR OTHER FEATURE OF THE SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTAND, AND AGREE TO BE BOUND BY THESE TERMS OF USE. IF YOU ARE ENTERING INTO THESE TERMS ON BEHALF OF A BUSINESS OR OTHER LEGAL ENTITY, YOU REPRESENT THAT YOU HAVE THE AUTHORITY TO BIND THAT ENTITY TO THESE TERMS.',
        'IF YOU DO NOT AGREE TO THESE TERMS OF USE, YOU MUST NOT ACCESS OR USE THE SERVICES.',
    ],
    footer: '© HitBox Collectibles LLC. All rights reserved.',
}

export const TERMS_OF_USE_SECTIONS: LegalSection[] = [
    {
        number: '1',
        title: 'Introduction',
        blocks: [
            {
                kind: 'paragraph',
                text: 'These Terms of Use ("Terms") govern your access to and use of the products, software, websites, mobile applications, connected technologies, digital experiences, online platforms, marketplaces, application programming interfaces ("APIs"), physical collectibles, digital collectibles, rewards, authentication systems, communications, and all other products and services made available by HitBox Collectibles LLC ("HitBox," "Company," "we," "our," or "us") (collectively, the "Services").',
            },
            {
                kind: 'paragraph',
                text: 'These Terms form a legally binding agreement between you and HitBox governing every interaction with the Services unless a separate written agreement expressly states otherwise.',
            },
            {
                kind: 'paragraph',
                text: 'Certain products, services, promotions, events, software features, creator programs, artist programs, marketplace features, beta features, or business services may be governed by supplemental agreements, guidelines, or policies. Where a supplemental agreement expressly conflicts with these Terms regarding a specific product or service, the supplemental agreement shall govern solely with respect to that product or service.',
            },
            {
                kind: 'paragraph',
                text: 'Your use of the Services is also subject to our Privacy Policy, which explains how we collect, use, disclose, and otherwise process Personal Information. The Privacy Policy is incorporated into these Terms by reference.',
            },
        ],
    },
    {
        number: '2',
        title: 'Eligibility',
        blocks: [
            {
                kind: 'paragraph',
                text: 'The Services are intended only for individuals and entities capable of entering into legally binding agreements under applicable law.',
            },
            { kind: 'paragraph', text: 'By using the Services, you represent and warrant that:' },
            { kind: 'listItem', marker: '(a)', text: 'you have the legal capacity to enter into these Terms;' },
            { kind: 'listItem', marker: '(b)', text: 'all information you provide is accurate, complete, and current;' },
            { kind: 'listItem', marker: '(c)', text: 'you will maintain the accuracy of your information throughout your use of the Services;' },
            { kind: 'listItem', marker: '(d)', text: 'your use of the Services will comply with these Terms and all applicable laws, regulations, and governmental requirements; and' },
            { kind: 'listItem', marker: '(e)', text: 'if you are acting on behalf of a company, organization, or other legal entity, you possess the legal authority to bind that entity to these Terms.' },
            {
                kind: 'paragraph',
                text: 'The Services are not intended for individuals who are prohibited from using them under applicable law.',
            },
        ],
    },
    {
        number: '3',
        title: 'Definitions',
        blocks: [
            { kind: 'paragraph', text: 'For purposes of these Terms:' },
            {
                kind: 'paragraph',
                text: '"Account" means a registered user account that enables access to certain features of the Services.',
            },
            {
                kind: 'paragraph',
                text: '"Collectible" means any physical or digital collectible, merchandise, media product, authenticated item, NFC-enabled product, serialized product, promotional item, artwork, digital asset, or other product distributed, licensed, sold, or otherwise made available through the Services.',
            },
            {
                kind: 'paragraph',
                text: '"Content" means all text, graphics, artwork, photographs, music, audio recordings, videos, software, code, designs, interfaces, user interfaces, databases, metadata, documentation, trademarks, logos, branding, digital assets, digital experiences, and all other materials made available through the Services.',
            },
            {
                kind: 'paragraph',
                text: '"Digital Content" means any digital asset, reward, experience, media, software functionality, downloadable material, streaming content, artwork, collectible enhancement, interactive feature, or other digital benefit accessible through the Services.',
            },
            {
                kind: 'paragraph',
                text: '"Services" means all products, software, applications, websites, APIs, connected technologies, physical products, marketplaces, communications, and other offerings owned, operated, licensed, or otherwise provided by HitBox.',
            },
            {
                kind: 'paragraph',
                text: '"User Content" means any information, images, artwork, comments, reviews, submissions, messages, files, applications, or other materials submitted, uploaded, transmitted, or otherwise provided by a user through the Services.',
            },
        ],
    },
    {
        number: '4',
        title: 'Account Registration',
        blocks: [
            { kind: 'paragraph', text: 'Certain portions of the Services require the creation of an Account.' },
            {
                kind: 'paragraph',
                text: 'You agree to provide complete, accurate, and current information during registration and to promptly update such information if it changes.',
            },
            {
                kind: 'paragraph',
                text: 'You are solely responsible for maintaining the confidentiality of your Account credentials and for all activities conducted through your Account.',
            },
            {
                kind: 'paragraph',
                text: 'You shall immediately notify HitBox of any unauthorized use of your Account or any other actual or suspected security incident affecting your Account.',
            },
            {
                kind: 'paragraph',
                text: 'We reserve the right, in our sole discretion and without prior notice, to suspend, restrict, disable, or terminate any Account where we reasonably believe such action is necessary to protect the Services, investigate fraud, enforce these Terms, comply with applicable law, protect intellectual property, preserve platform integrity, or safeguard other users.',
            },
        ],
    },
    {
        number: '5',
        title: 'License to Use the Services',
        blocks: [
            {
                kind: 'paragraph',
                text: 'Subject to your continued compliance with these Terms, HitBox grants you a limited, personal, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Services solely for their intended purposes.',
            },
            {
                kind: 'paragraph',
                text: 'This license does not transfer ownership of the Services or any intellectual property associated with them.',
            },
            {
                kind: 'paragraph',
                text: 'Except as expressly authorized by HitBox in writing, you may not: copy, reproduce, modify, distribute, publish, display, transmit, perform, reverse engineer, decompile, disassemble, create derivative works from, sell, lease, sublicense, commercially exploit, scrape, automate access to, or otherwise use any portion of the Services beyond the rights expressly granted under these Terms.',
            },
            { kind: 'paragraph', text: 'Any rights not expressly granted are reserved by HitBox.' },
        ],
    },
    {
        number: '6',
        title: 'Ownership of the Services',
        blocks: [
            {
                kind: 'paragraph',
                text: 'The Services, including all software, technology, source code, object code, algorithms, authentication systems, databases, platform architecture, interfaces, graphics, artwork, branding, trademarks, copyrights, patents, trade dress, trade secrets, documentation, inventions, designs, business methods, audiovisual works, Digital Content, and all related intellectual property rights are and shall remain the exclusive property of HitBox and its licensors.',
            },
            {
                kind: 'paragraph',
                text: 'Nothing contained in these Terms shall be interpreted as transferring ownership of any intellectual property rights to any user.',
            },
            {
                kind: 'paragraph',
                text: 'The purchase or possession of a Collectible does not transfer ownership of the software, authentication technology, NFC technology, digital platform, patents, copyrights, trademarks, trade secrets, backend systems, reward systems, APIs, source code, or any other intellectual property associated with the Services except as expressly stated in a separate written agreement executed by HitBox.',
            },
            {
                kind: 'paragraph',
                text: 'All goodwill arising from the use of HitBox trademarks, branding, logos, product names, and other proprietary identifiers shall inure exclusively to the benefit of HitBox.',
            },
        ],
    },
    {
        number: '7',
        title: 'Connected Collectibles',
        blocks: [
            {
                kind: 'paragraph',
                text: 'The Services include physical and digital Collectibles that may incorporate Near Field Communication ("NFC"), serialized identifiers, encrypted identifiers, authentication technologies, software-based verification systems, digital ownership records, or other technologies designed to connect physical products with digital experiences available through the Services.',
            },
            {
                kind: 'paragraph',
                text: 'A Collectible may provide access to Digital Content, authentication services, ownership records maintained through the Services, rewards, experiences, artist content, promotions, community features, or other functionality determined by HitBox. The specific functionality associated with any Collectible may vary over time and may depend upon technical compatibility, licensing rights, geographic availability, platform updates, security considerations, or other operational requirements.',
            },
            {
                kind: 'paragraph',
                text: 'The purchase or possession of a Collectible does not guarantee perpetual access to any particular Digital Content, feature, experience, or reward. Certain features may expire, evolve, be replaced, or become unavailable due to licensing restrictions, technological changes, security requirements, legal obligations, product improvements, or the discontinuation of a particular service.',
            },
            {
                kind: 'paragraph',
                text: 'HitBox reserves the right to suspend, disable, invalidate, revoke, or refuse authentication of any Collectible that we reasonably determine has been altered, duplicated, cloned, counterfeited, fraudulently obtained, manipulated, compromised, tampered with, or otherwise used in violation of these Terms or applicable law.',
            },
            {
                kind: 'paragraph',
                text: 'Where ownership records are maintained through the Services, such records exist solely for purposes of administering the HitBox platform and should not be interpreted as creating legal title, property rights, securities, financial interests, or ownership rights beyond those expressly granted by HitBox.',
            },
        ],
    },
    {
        number: '8',
        title: 'Digital Content and Rewards',
        blocks: [
            {
                kind: 'paragraph',
                text: 'The Services may provide access to Digital Content, exclusive experiences, artist materials, promotional benefits, software functionality, downloadable content, streaming media, virtual items, achievements, badges, collectibles, early access opportunities, event access, discounts, loyalty benefits, or other rewards.',
            },
            {
                kind: 'paragraph',
                text: 'Unless expressly stated otherwise in writing by HitBox, all Digital Content is licensed, not sold.',
            },
            {
                kind: 'paragraph',
                text: 'Subject to your continued compliance with these Terms, HitBox grants you a limited, revocable, non-exclusive, non-transferable, non-sublicensable license to access and use Digital Content solely for your personal, non-commercial use.',
            },
            {
                kind: 'paragraph',
                text: 'You acknowledge and agree that ownership of a physical Collectible does not transfer ownership of any associated Digital Content, copyrights, music, audiovisual works, artwork, software, source code, databases, or other intellectual property made available through the Services.',
            },
            {
                kind: 'paragraph',
                text: 'HitBox may modify, replace, update, discontinue, remove, or substitute Digital Content, rewards, or platform features at any time where reasonably necessary for operational, licensing, legal, technical, security, or business reasons. Nothing in these Terms shall be interpreted as guaranteeing that any particular Digital Content or reward will remain available indefinitely.',
            },
            {
                kind: 'paragraph',
                text: 'Digital Content, rewards, promotional benefits, and other platform features possess no monetary value unless expressly stated otherwise by HitBox and may not be redeemed for cash, transferred outside the Services except where expressly permitted, or exchanged for legal tender.',
            },
        ],
    },
    {
        number: '9',
        title: 'Purchases, Payments, and Orders',
        blocks: [
            {
                kind: 'paragraph',
                text: 'All purchases made through the Services are subject to product availability, acceptance by HitBox, and successful payment authorization.',
            },
            {
                kind: 'paragraph',
                text: 'Prices, product descriptions, specifications, availability, shipping estimates, promotional offers, discounts, taxes, duties, and fees are subject to change without prior notice.',
            },
            {
                kind: 'paragraph',
                text: 'HitBox reserves the right to refuse, limit, cancel, or reject any order, in whole or in part, including where we reasonably believe an order involves pricing errors, suspected fraud, unauthorized transactions, inventory inaccuracies, resale activity, export restrictions, violations of these Terms, or other circumstances affecting the integrity of the transaction.',
            },
            {
                kind: 'paragraph',
                text: 'Payments are processed through independent third-party payment service providers. HitBox does not store complete payment card information except as required to maintain lawful transaction records or comply with applicable legal obligations. Your use of third-party payment services may also be governed by the terms and privacy policies of those providers.',
            },
            {
                kind: 'paragraph',
                text: 'You are responsible for all applicable taxes, duties, customs fees, governmental charges, and similar assessments associated with your purchases unless otherwise required by applicable law.',
            },
        ],
    },
    {
        number: '10',
        title: 'Shipping, Delivery, and Risk of Loss',
        blocks: [
            {
                kind: 'paragraph',
                text: 'Shipping estimates are provided for convenience only and do not constitute guaranteed delivery dates.',
            },
            {
                kind: 'paragraph',
                text: "Delivery times may be affected by manufacturing schedules, carrier delays, customs processing, weather events, labor disruptions, governmental actions, supply chain interruptions, force majeure events, or other circumstances beyond HitBox's reasonable control.",
            },
            {
                kind: 'paragraph',
                text: 'Unless otherwise required by applicable law or expressly stated in writing, risk of loss and title to physical products pass to you upon delivery of the shipment to the carrier designated by HitBox for transportation.',
            },
            {
                kind: 'paragraph',
                text: 'You are responsible for providing accurate shipping information. HitBox shall not be responsible for delays, failed deliveries, additional shipping costs, customs charges, or losses resulting from inaccurate or incomplete delivery information supplied by you.',
            },
        ],
    },
    {
        number: '11',
        title: 'User Content',
        blocks: [
            {
                kind: 'paragraph',
                text: 'Certain portions of the Services may permit users to submit, upload, transmit, publish, or otherwise make available User Content.',
            },
            {
                kind: 'paragraph',
                text: 'You retain ownership of any intellectual property rights you possess in your User Content.',
            },
            {
                kind: 'paragraph',
                text: 'However, by submitting User Content through the Services, you grant HitBox a worldwide, non-exclusive, royalty-free, fully paid, transferable, sublicensable license to host, store, reproduce, modify for technical purposes, adapt, translate, publish, distribute, display, perform, analyze, and otherwise use such User Content solely for purposes of operating, improving, securing, promoting, and providing the Services.',
            },
            { kind: 'paragraph', text: 'You represent and warrant that:' },
            { kind: 'listItem', marker: '(a)', text: 'you own or otherwise possess all rights necessary to submit the User Content;' },
            { kind: 'listItem', marker: '(b)', text: 'your User Content does not infringe or misappropriate any copyright, trademark, patent, trade secret, privacy right, publicity right, contractual right, or other legal right of any third party;' },
            { kind: 'listItem', marker: '(c)', text: 'your User Content complies with these Terms and all applicable laws; and' },
            { kind: 'listItem', marker: '(d)', text: 'your User Content does not contain malicious code, harmful software, fraudulent materials, defamatory content, unlawful material, or content intended to interfere with the operation of the Services.' },
            {
                kind: 'paragraph',
                text: 'HitBox reserves the right, but assumes no obligation, to review, monitor, refuse, restrict, remove, or disable access to User Content at any time where we reasonably determine that such action is necessary to comply with applicable law, enforce these Terms, protect intellectual property, safeguard users, preserve platform integrity, or otherwise protect the legitimate interests of HitBox.',
            },
        ],
    },
    {
        number: '12',
        title: 'Artist and Creator Content',
        blocks: [
            {
                kind: 'paragraph',
                text: 'The Services may feature content provided by artists, creators, licensors, partners, record labels, studios, sports organizations, brands, or other third-party rights holders.',
            },
            {
                kind: 'paragraph',
                text: 'Unless expressly stated otherwise, all copyrights, trademarks, publicity rights, neighboring rights, moral rights, and other intellectual property rights relating to such content remain the exclusive property of their respective owners.',
            },
            {
                kind: 'paragraph',
                text: 'Your purchase or possession of a Collectible, or your access to Digital Content associated with that Collectible, grants only the limited license expressly provided through the Services. It does not grant any ownership interest in the underlying creative works or authorize reproduction, distribution, public performance, commercial exploitation, modification, synchronization, minting, tokenization, artificial intelligence training, or any other use beyond that expressly permitted by these Terms or applicable law.',
            },
        ],
    },
    {
        number: '13',
        title: 'Prohibited Conduct',
        blocks: [
            {
                kind: 'paragraph',
                text: 'You agree that you will not, directly or indirectly, engage in any activity that interferes with the operation, security, integrity, or intended use of the Services.',
            },
            { kind: 'paragraph', text: 'Without limiting the foregoing, you shall not:' },
            { kind: 'listItem', marker: '(a)', text: 'violate any applicable law or regulation;' },
            { kind: 'listItem', marker: '(b)', text: 'infringe, misappropriate, dilute, or otherwise violate the intellectual property or proprietary rights of HitBox or any third party;' },
            { kind: 'listItem', marker: '(c)', text: 'access or attempt to access any portion of the Services, systems, databases, APIs, networks, or infrastructure through unauthorized means;' },
            { kind: 'listItem', marker: '(d)', text: 'reverse engineer, decompile, disassemble, decode, or otherwise attempt to derive the source code, algorithms, security architecture, authentication mechanisms, encryption methods, or underlying technology of the Services except where such restrictions are prohibited by applicable law;' },
            { kind: 'listItem', marker: '(e)', text: 'circumvent, disable, interfere with, or defeat any security feature, authentication process, access control, technological protection measure, usage limitation, or digital rights management system implemented by HitBox;' },
            { kind: 'listItem', marker: '(f)', text: 'clone, duplicate, emulate, spoof, manipulate, modify, or otherwise interfere with any Collectible, NFC tag, serialized identifier, authentication credential, secure identifier, or other technology used to verify the authenticity or ownership status of a Collectible;' },
            { kind: 'listItem', marker: '(g)', text: 'use robots, crawlers, spiders, scrapers, automated scripts, artificial intelligence agents, bots, data mining tools, or similar technologies to access, monitor, extract, copy, index, or collect information from the Services except where expressly authorized in writing by HitBox;' },
            { kind: 'listItem', marker: '(h)', text: "upload, transmit, distribute, or introduce viruses, malware, ransomware, spyware, malicious code, or any technology intended to disrupt, damage, monitor, or gain unauthorized access to the Services or any user's device;" },
            { kind: 'listItem', marker: '(i)', text: "interfere with another user's access to or enjoyment of the Services;" },
            { kind: 'listItem', marker: '(j)', text: 'impersonate another individual or entity or falsely represent your affiliation with any person or organization;' },
            { kind: 'listItem', marker: '(k)', text: 'engage in fraudulent transactions, chargeback abuse, money laundering, unauthorized resale activity, or any scheme intended to manipulate the operation of the Services;' },
            { kind: 'listItem', marker: '(l)', text: "use the Services to develop, train, improve, benchmark, or validate artificial intelligence models, machine learning systems, automated decision-making technologies, or similar technologies without the Company's prior written consent;" },
            { kind: 'listItem', marker: '(m)', text: 'exploit, reproduce, distribute, publicly display, publicly perform, commercially exploit, or otherwise use the Services or any Content except as expressly permitted by these Terms; or' },
            { kind: 'listItem', marker: '(n)', text: 'encourage, facilitate, or assist any other person in engaging in any conduct prohibited by these Terms.' },
            {
                kind: 'paragraph',
                text: 'HitBox reserves the right to investigate suspected violations of these Terms and to take any action reasonably necessary to protect the Services, including suspending Accounts, invalidating Collectibles, terminating licenses, reporting unlawful conduct to appropriate authorities, pursuing civil remedies, or taking any other action available under applicable law.',
            },
        ],
    },
    {
        number: '14',
        title: 'Marketplace, Transfers, and Secondary Transactions',
        blocks: [
            {
                kind: 'paragraph',
                text: 'Certain Services may permit the transfer, exchange, gifting, resale, verification, or management of Collectibles or associated Digital Content. Such functionality may not be available for every product or in every jurisdiction.',
            },
            {
                kind: 'paragraph',
                text: 'Where transfer functionality is supported by the Services, all transactions remain subject to these Terms, any supplemental marketplace policies, applicable law, and any technical or security requirements established by HitBox.',
            },
            {
                kind: 'paragraph',
                text: 'HitBox reserves the right to require authentication, identity verification, ownership verification, fraud screening, transfer limitations, waiting periods, transaction limits, geographic restrictions, licensing restrictions, or other reasonable safeguards before permitting any transfer or secondary transaction.',
            },
            {
                kind: 'paragraph',
                text: 'HitBox does not guarantee the value, authenticity, condition, legality, collectability, rarity, future availability, investment potential, resale price, or market demand of any Collectible or Digital Content.',
            },
            {
                kind: 'paragraph',
                text: 'Except where expressly agreed in writing, HitBox is not a party to transactions conducted solely between users and assumes no responsibility for disputes arising between buyers, sellers, collectors, or other third parties.',
            },
        ],
    },
    {
        number: '15',
        title: 'Third-Party Services',
        blocks: [
            {
                kind: 'paragraph',
                text: 'The Services may integrate with or provide access to websites, applications, payment processors, authentication providers, cloud service providers, shipping carriers, social media platforms, analytics providers, communication services, software providers, or other products and services operated by independent third parties.',
            },
            {
                kind: 'paragraph',
                text: 'Such third-party services are governed exclusively by their own terms, conditions, and privacy practices. HitBox does not own or control these services and makes no representation or warranty regarding their availability, security, accuracy, functionality, or legal compliance.',
            },
            {
                kind: 'paragraph',
                text: 'Your use of any third-party service is undertaken solely at your own risk and is subject to the applicable agreements governing that service.',
            },
        ],
    },
    {
        number: '16',
        title: 'Software, Mobile Applications, and APIs',
        blocks: [
            {
                kind: 'paragraph',
                text: 'Any software, mobile application, software development kit, API, firmware, or other technology made available by HitBox is licensed, not sold.',
            },
            {
                kind: 'paragraph',
                text: 'Subject to these Terms, HitBox grants you a limited, revocable, non-exclusive, non-transferable, non-sublicensable license to install and use such software solely in connection with the Services and only in accordance with the accompanying documentation.',
            },
            {
                kind: 'paragraph',
                text: 'You shall not modify, distribute, lease, sublicense, rent, reverse engineer, decompile, create derivative works from, or otherwise exploit any software or API except where expressly authorized by HitBox or where such restrictions are prohibited by applicable law.',
            },
            {
                kind: 'paragraph',
                text: 'HitBox reserves the right to modify, update, suspend, discontinue, replace, restrict, or remove APIs, software features, developer tools, technical documentation, or related functionality at any time without liability.',
            },
        ],
    },
    {
        number: '17',
        title: 'Artificial Intelligence and Automated Features',
        blocks: [
            {
                kind: 'paragraph',
                text: 'Certain portions of the Services may incorporate artificial intelligence, machine learning, recommendation systems, natural language processing, computer vision, fraud detection technologies, automated moderation, predictive analytics, or similar technologies designed to improve functionality, personalization, security, authentication, customer support, operational efficiency, or user experience.',
            },
            {
                kind: 'paragraph',
                text: 'You acknowledge that outputs generated by artificial intelligence systems may not always be accurate, complete, current, or suitable for every purpose and should not be relied upon as the sole basis for legal, financial, medical, commercial, or other significant decisions.',
            },
            {
                kind: 'paragraph',
                text: 'Except where expressly authorized by HitBox, you may not use the Services or any Content for the purpose of training, developing, evaluating, benchmarking, or improving artificial intelligence systems or machine learning models.',
            },
        ],
    },
    {
        number: '18',
        title: 'Beta Features',
        blocks: [
            {
                kind: 'paragraph',
                text: 'From time to time, HitBox may offer experimental, preview, early-access, alpha, beta, or other pre-release features.',
            },
            {
                kind: 'paragraph',
                text: 'Beta features are provided for evaluation purposes only and may contain errors, interruptions, defects, security vulnerabilities, incomplete functionality, or compatibility issues.',
            },
            {
                kind: 'paragraph',
                text: 'HitBox may modify, suspend, discontinue, or remove Beta features at any time without notice or liability and makes no representation that Beta features will become generally available.',
            },
            {
                kind: 'paragraph',
                text: 'Your use of Beta features is entirely voluntary and at your own risk.',
            },
        ],
    },
    {
        number: '19',
        title: 'Availability of the Services',
        blocks: [
            {
                kind: 'paragraph',
                text: 'HitBox continually develops and improves the Services. Accordingly, we reserve the right to modify, enhance, replace, suspend, discontinue, or remove any portion of the Services at any time, with or without notice, where reasonably necessary for business, operational, legal, security, licensing, or technical reasons.',
            },
            {
                kind: 'paragraph',
                text: 'We do not guarantee that the Services, or any portion thereof, will be available at all times or operate without interruption, delay, error, or incompatibility.',
            },
            {
                kind: 'paragraph',
                text: 'Scheduled maintenance, emergency maintenance, software updates, infrastructure failures, telecommunications outages, cybersecurity incidents, governmental actions, force majeure events, and other circumstances beyond our reasonable control may affect the availability or performance of the Services.',
            },
            {
                kind: 'paragraph',
                text: 'Nothing in these Terms shall be construed as creating any obligation for HitBox to continue offering any particular Service, feature, Collectible, Digital Content, reward, marketplace functionality, or technology for any specific period of time.',
            },
        ],
    },
    {
        number: '20',
        title: 'Suspension and Termination',
        blocks: [
            {
                kind: 'paragraph',
                text: 'HitBox reserves the right, in its sole discretion and without prior notice where permitted by applicable law, to suspend, restrict, disable, or terminate your Account, access to the Services, licenses granted under these Terms, or the functionality of any Collectible where we reasonably determine that such action is necessary to protect the Services, safeguard users, investigate suspected misconduct, comply with applicable law, enforce these Terms, protect intellectual property, respond to security threats, or preserve the integrity of the HitBox platform.',
            },
            {
                kind: 'paragraph',
                text: 'Grounds for suspension or termination may include, without limitation, fraud or attempted fraud; unauthorized access to the Services; violation of these Terms or any applicable policy; infringement of intellectual property rights; submission of false or misleading information; abuse of promotional programs; manipulation or cloning of Collectibles or authentication technologies; unauthorized commercial exploitation of the Services; unlawful conduct; or any activity that reasonably threatens the security, reputation, operations, or legal interests of HitBox or its users.',
            },
            {
                kind: 'paragraph',
                text: 'Termination of your Account shall not affect any rights or obligations that accrued prior to termination. Upon termination, all licenses granted under these Terms shall immediately cease unless otherwise expressly stated by HitBox in writing. Provisions that by their nature are intended to survive termination—including those relating to intellectual property, payment obligations, indemnification, disclaimers, limitations of liability, dispute resolution, governing law, and interpretation—shall survive the termination or expiration of these Terms.',
            },
        ],
    },
    {
        number: '21',
        title: 'Disclaimers',
        blocks: [
            {
                kind: 'notice',
                text: 'THE SERVICES ARE PROVIDED ON AN "AS IS," "AS AVAILABLE," AND "WITH ALL FAULTS" BASIS TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.',
            },
            {
                kind: 'paragraph',
                text: 'TO THE FULLEST EXTENT PERMITTED BY LAW, HITBOX DISCLAIMS ALL WARRANTIES, REPRESENTATIONS, CONDITIONS, AND GUARANTEES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, QUIET ENJOYMENT, SYSTEM INTEGRATION, OR THAT THE SERVICES WILL MEET YOUR REQUIREMENTS.',
            },
            {
                kind: 'paragraph',
                text: 'WITHOUT LIMITING THE FOREGOING, HITBOX DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, AVAILABLE AT ANY PARTICULAR TIME OR LOCATION, FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS, OR THAT ANY DEFECTS WILL BE CORRECTED.',
            },
            {
                kind: 'paragraph',
                text: 'HITBOX MAKES NO REPRESENTATION OR WARRANTY REGARDING THE CONTINUED AVAILABILITY OF ANY COLLECTIBLE, DIGITAL CONTENT, REWARD, MARKETPLACE FEATURE, ARTIST CONTENT, PROMOTION, SOFTWARE FUNCTIONALITY, OR OTHER FEATURE OF THE SERVICES.',
            },
            {
                kind: 'paragraph',
                text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, HITBOX DISCLAIMS ANY RESPONSIBILITY FOR THE ACTS, OMISSIONS, PRODUCTS, SERVICES, OR CONTENT OF THIRD PARTIES, INCLUDING PAYMENT PROCESSORS, SHIPPING PROVIDERS, ARTISTS, LICENSORS, SOCIAL MEDIA PLATFORMS, BUSINESS PARTNERS, OR OTHER INDEPENDENT SERVICE PROVIDERS.',
            },
            {
                kind: 'paragraph',
                text: 'NO INFORMATION OR ADVICE PROVIDED BY HITBOX, WHETHER ORAL OR WRITTEN, SHALL CREATE ANY WARRANTY NOT EXPRESSLY SET FORTH IN THESE TERMS.',
            },
        ],
    },
    {
        number: '22',
        title: 'Limitation of Liability',
        blocks: [
            {
                kind: 'paragraph',
                text: 'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, HITBOX, ITS PARENT COMPANIES, SUBSIDIARIES, AFFILIATES, LICENSORS, SERVICE PROVIDERS, BUSINESS PARTNERS, OFFICERS, DIRECTORS, MEMBERS, MANAGERS, EMPLOYEES, CONTRACTORS, AGENTS, SUCCESSORS, AND ASSIGNS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, PUNITIVE, OR ENHANCED DAMAGES, INCLUDING LOSS OF PROFITS, LOSS OF REVENUE, LOSS OF BUSINESS OPPORTUNITIES, LOSS OF GOODWILL, LOSS OF DATA, BUSINESS INTERRUPTION, DIMINUTION IN VALUE, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE SERVICES, REGARDLESS OF THE LEGAL THEORY ASSERTED AND EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.',
            },
            {
                kind: 'notice',
                text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE AGGREGATE LIABILITY OF HITBOX ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE GREATER OF (A) THE TOTAL AMOUNT PAID BY YOU TO HITBOX DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM OR (B) ONE HUNDRED UNITED STATES DOLLARS (US $100.00).',
            },
            {
                kind: 'paragraph',
                text: 'THE LIMITATIONS SET FORTH IN THIS SECTION CONSTITUTE A FUNDAMENTAL BASIS OF THE BARGAIN BETWEEN THE PARTIES AND SHALL APPLY REGARDLESS OF WHETHER ANY LIMITED REMEDY FAILS OF ITS ESSENTIAL PURPOSE.',
            },
            {
                kind: 'paragraph',
                text: 'NOTHING IN THESE TERMS SHALL LIMIT LIABILITY THAT CANNOT LAWFULLY BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.',
            },
        ],
    },
    {
        number: '23',
        title: 'Indemnification',
        blocks: [
            {
                kind: 'paragraph',
                text: "You agree to defend, indemnify, and hold harmless HitBox and its parent companies, subsidiaries, affiliates, licensors, service providers, business partners, officers, directors, members, managers, employees, contractors, agents, successors, and assigns from and against any and all claims, demands, actions, proceedings, investigations, liabilities, damages, judgments, settlements, penalties, fines, losses, costs, and expenses, including reasonable attorneys' fees and litigation expenses, arising out of or relating to:",
            },
            { kind: 'listItem', marker: '(a)', text: 'your access to or use of the Services;' },
            { kind: 'listItem', marker: '(b)', text: 'your violation of these Terms or any applicable policy;' },
            { kind: 'listItem', marker: '(c)', text: 'your violation of any applicable law or regulation;' },
            { kind: 'listItem', marker: '(d)', text: 'your infringement or misappropriation of the intellectual property or other legal rights of any person or entity;' },
            { kind: 'listItem', marker: '(e)', text: 'your User Content;' },
            { kind: 'listItem', marker: '(f)', text: 'your misuse of Collectibles, Digital Content, authentication technologies, APIs, software, or other components of the Services; or' },
            { kind: 'listItem', marker: '(g)', text: 'any fraudulent, negligent, reckless, or intentional misconduct by you.' },
            {
                kind: 'paragraph',
                text: 'HitBox reserves the right, at its own expense, to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you agree to cooperate fully with our defense.',
            },
        ],
    },
    {
        number: '24',
        title: 'Force Majeure',
        blocks: [
            {
                kind: 'paragraph',
                text: "HitBox shall not be liable for any delay, interruption, failure to perform, or inability to provide the Services resulting from circumstances beyond its reasonable control, including acts of God, natural disasters, pandemics, epidemics, public health emergencies, fires, floods, earthquakes, severe weather, war, terrorism, civil unrest, labor disputes, governmental actions, embargoes, sanctions, power failures, telecommunications failures, internet outages, cybersecurity incidents, supply chain disruptions, transportation delays, manufacturing interruptions, shortages of materials, failures of third-party service providers, or any other event beyond HitBox's reasonable control.",
            },
        ],
    },
    {
        number: '25',
        title: 'Governing Law',
        blocks: [
            {
                kind: 'paragraph',
                text: 'These Terms and any dispute arising out of or relating to the Services shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of laws principles.',
            },
            {
                kind: 'paragraph',
                text: 'The United Nations Convention on Contracts for the International Sale of Goods shall not apply to these Terms.',
            },
            {
                kind: 'paragraph',
                text: 'Nothing contained in these Terms shall be interpreted as limiting any non-waivable rights afforded to consumers under applicable law.',
            },
        ],
    },
    {
        number: '26',
        title: 'Dispute Resolution',
        blocks: [
            {
                kind: 'notice',
                text: 'PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS.',
            },
            {
                kind: 'paragraph',
                text: 'To the fullest extent permitted by applicable law, the parties agree to resolve disputes in accordance with this Section before initiating litigation.',
            },
            { kind: 'subheading', text: 'Good Faith Resolution' },
            {
                kind: 'paragraph',
                text: 'Before commencing any legal proceeding, you agree to first provide HitBox with written notice describing the nature of the dispute and the relief requested. The parties agree to use commercially reasonable efforts to resolve the dispute through informal negotiations for a period of at least thirty (30) days following receipt of such notice.',
            },
            {
                kind: 'paragraph',
                text: 'Nothing in this Section prevents either party from seeking temporary or preliminary injunctive relief where necessary to protect intellectual property, confidential information, trade secrets, security interests, or other rights that could suffer immediate and irreparable harm.',
            },
            { kind: 'subheading', text: 'Binding Arbitration' },
            {
                kind: 'paragraph',
                text: 'Except where prohibited by applicable law or expressly provided otherwise in these Terms, any dispute, controversy, or claim arising out of or relating to these Terms or the Services, including their formation, interpretation, enforceability, breach, termination, or validity, shall be resolved exclusively through final and binding arbitration administered by the American Arbitration Association ("AAA") under its applicable Consumer Arbitration Rules or Commercial Arbitration Rules, as appropriate.',
            },
            {
                kind: 'paragraph',
                text: 'The arbitration shall be conducted before a single arbitrator.',
            },
            {
                kind: 'paragraph',
                text: 'Unless otherwise required by applicable law, the arbitration shall take place in Polk County, Florida. The arbitrator may conduct hearings remotely where appropriate.',
            },
            {
                kind: 'paragraph',
                text: 'The arbitrator shall have exclusive authority to determine issues regarding the scope, enforceability, or applicability of this arbitration agreement.',
            },
            {
                kind: 'paragraph',
                text: 'The arbitrator may award only those remedies available under applicable law and these Terms.',
            },
            {
                kind: 'paragraph',
                text: 'Judgment upon the arbitration award may be entered in any court having competent jurisdiction.',
            },
            { kind: 'subheading', text: 'Class Action Waiver' },
            {
                kind: 'paragraph',
                text: 'To the fullest extent permitted by law, all disputes shall be conducted solely on an individual basis.',
            },
            {
                kind: 'paragraph',
                text: 'Neither you nor HitBox shall participate as a plaintiff, claimant, class representative, private attorney general, or class member in any purported class action, collective action, representative proceeding, or consolidated action relating to the Services.',
            },
            {
                kind: 'paragraph',
                text: 'The arbitrator shall have no authority to consolidate claims involving multiple parties or preside over any class, collective, representative, or mass arbitration.',
            },
            { kind: 'subheading', text: 'Jury Trial Waiver' },
            {
                kind: 'notice',
                text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, BOTH YOU AND HITBOX KNOWINGLY, VOLUNTARILY, AND IRREVOCABLY WAIVE ANY RIGHT TO A TRIAL BY JURY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICES.',
            },
            { kind: 'subheading', text: 'Small Claims' },
            {
                kind: 'paragraph',
                text: 'Nothing in this Section prevents either party from bringing an individual claim within the jurisdictional limits of an appropriate small claims court.',
            },
            { kind: 'subheading', text: 'Intellectual Property' },
            {
                kind: 'paragraph',
                text: 'Notwithstanding the foregoing, HitBox may seek temporary restraining orders, preliminary injunctions, permanent injunctions, or other equitable relief in any court of competent jurisdiction to protect its intellectual property, confidential information, authentication systems, trade secrets, software, patents, trademarks, copyrights, proprietary technologies, or platform security.',
            },
        ],
    },
    {
        number: '27',
        title: 'Electronic Communications',
        blocks: [
            {
                kind: 'paragraph',
                text: 'By accessing or using the Services, you consent to receive communications from HitBox electronically.',
            },
            {
                kind: 'paragraph',
                text: 'Such communications may include notices, disclosures, invoices, confirmations, receipts, customer support communications, security notifications, legal notices, policy updates, transactional messages, and other information relating to the Services.',
            },
            {
                kind: 'paragraph',
                text: 'You agree that electronic communications satisfy any legal requirement that such communications be in writing.',
            },
            {
                kind: 'paragraph',
                text: 'You are responsible for maintaining current contact information within your Account and for ensuring your ability to receive electronic communications.',
            },
        ],
    },
    {
        number: '28',
        title: 'Copyright Policy',
        blocks: [
            {
                kind: 'paragraph',
                text: 'HitBox respects the intellectual property rights of others and expects users to do the same.',
            },
            {
                kind: 'paragraph',
                text: 'If you believe that material available through the Services infringes your copyright, you may submit a written notification containing substantially the following information:',
            },
            { kind: 'listItem', marker: '(a)', text: 'identification of the copyrighted work claimed to have been infringed;' },
            { kind: 'listItem', marker: '(b)', text: 'identification of the allegedly infringing material and information reasonably sufficient to permit HitBox to locate the material;' },
            { kind: 'listItem', marker: '(c)', text: 'your name, mailing address, telephone number, and email address;' },
            { kind: 'listItem', marker: '(d)', text: 'a statement that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or applicable law;' },
            { kind: 'listItem', marker: '(e)', text: 'a statement made under penalty of perjury that the information contained in the notice is accurate and that you are authorized to act on behalf of the copyright owner; and' },
            { kind: 'listItem', marker: '(f)', text: 'your physical or electronic signature.' },
            {
                kind: 'paragraph',
                text: 'HitBox reserves the right to remove or disable access to allegedly infringing material, terminate repeat infringers, and otherwise comply with applicable intellectual property laws.',
            },
            {
                kind: 'paragraph',
                text: 'Counter-notifications may be submitted where permitted by applicable law.',
            },
            { kind: 'paragraph', text: 'DMCA Notices should be sent to:' },
            { kind: 'contact', label: 'Attention', value: 'DMCA Agent' },
            { kind: 'contact', label: 'Company', value: 'HitBox Collectibles LLC' },
            // Placeholders carried over verbatim from the source document — swap
            // these for the real address once legal supplies them.
            { kind: 'contact', label: 'Email', value: '[DMCA Email]' },
            { kind: 'contact', label: 'Mailing Address', value: '[Company Address]' },
        ],
    },
    {
        number: '29',
        title: 'Export Compliance',
        blocks: [
            {
                kind: 'paragraph',
                text: 'You represent and warrant that you are not located in, organized under the laws of, ordinarily resident in, or acting on behalf of any country or territory subject to comprehensive sanctions or trade restrictions imposed by the United States or other applicable governmental authorities.',
            },
            {
                kind: 'paragraph',
                text: 'You further represent that you are not identified on any governmental list of prohibited or restricted persons with whom transactions are prohibited.',
            },
            {
                kind: 'paragraph',
                text: 'You agree to comply with all applicable export control laws, sanctions regulations, and trade restrictions applicable to your use of the Services.',
            },
        ],
    },
    {
        number: '30',
        title: 'Modifications to the Services',
        blocks: [
            {
                kind: 'paragraph',
                text: 'HitBox continually develops, improves, and expands the Services.',
            },
            {
                kind: 'paragraph',
                text: 'Accordingly, HitBox reserves the right, at any time and without liability, to add, remove, modify, replace, suspend, discontinue, redesign, or otherwise alter any aspect of the Services, including software functionality, connected technologies, authentication systems, Collectibles, Digital Content, APIs, pricing, features, reward programs, marketplace functionality, or technical infrastructure.',
            },
            {
                kind: 'paragraph',
                text: 'Nothing contained in these Terms shall obligate HitBox to continue offering any particular product, technology, feature, reward, or service for any specific duration.',
            },
        ],
    },
    {
        number: '31',
        title: 'Changes to These Terms',
        blocks: [
            {
                kind: 'paragraph',
                text: 'HitBox may revise these Terms from time to time to reflect changes in applicable law, technological developments, business practices, security requirements, or the Services.',
            },
            {
                kind: 'paragraph',
                text: 'Updated Terms will become effective upon publication unless a different effective date is specified.',
            },
            {
                kind: 'paragraph',
                text: 'Your continued access to or use of the Services following the effective date of revised Terms constitutes your acceptance of the updated Terms.',
            },
            {
                kind: 'paragraph',
                text: 'If you do not agree to the revised Terms, you must discontinue use of the Services.',
            },
        ],
    },
    {
        number: '32',
        title: 'Assignment',
        blocks: [
            {
                kind: 'paragraph',
                text: 'You may not assign, transfer, delegate, sublicense, or otherwise convey any rights or obligations under these Terms without the prior written consent of HitBox.',
            },
            {
                kind: 'paragraph',
                text: 'Any attempted assignment in violation of this Section shall be null and void.',
            },
            {
                kind: 'paragraph',
                text: 'HitBox may assign or transfer these Terms, in whole or in part, without restriction in connection with a merger, acquisition, financing, corporate restructuring, sale of assets, change of control, bankruptcy proceeding, or other corporate transaction.',
            },
            {
                kind: 'paragraph',
                text: 'These Terms shall bind and benefit the parties and their respective permitted successors and assigns.',
            },
        ],
    },
    {
        number: '33',
        title: 'Severability',
        blocks: [
            {
                kind: 'paragraph',
                text: 'If any provision of these Terms is determined to be unlawful, invalid, or unenforceable by a court or arbitrator of competent jurisdiction, that provision shall be enforced to the maximum extent permissible, and the remaining provisions shall remain in full force and effect.',
            },
        ],
    },
    {
        number: '34',
        title: 'No Waiver',
        blocks: [
            {
                kind: 'paragraph',
                text: 'No failure or delay by HitBox in exercising any right, remedy, or provision under these Terms shall constitute a waiver of that right or remedy.',
            },
            {
                kind: 'paragraph',
                text: 'Any waiver must be in writing and signed by an authorized representative of HitBox.',
            },
        ],
    },
    {
        number: '35',
        title: 'Entire Agreement',
        blocks: [
            {
                kind: 'paragraph',
                text: 'These Terms, together with the Privacy Policy and any supplemental policies or agreements expressly incorporated by reference, constitute the complete and exclusive agreement between you and HitBox regarding the Services and supersede all prior or contemporaneous communications, negotiations, representations, understandings, and agreements relating to the subject matter hereof.',
            },
        ],
    },
    {
        number: '36',
        title: 'Interpretation',
        blocks: [
            {
                kind: 'paragraph',
                text: 'The headings used in these Terms are provided solely for convenience and shall not affect their interpretation.',
            },
            {
                kind: 'paragraph',
                text: 'The words "including," "include," and similar expressions shall be interpreted to mean "including without limitation."',
            },
            {
                kind: 'paragraph',
                text: 'Unless the context otherwise requires, words in the singular include the plural, words in the plural include the singular, and references to one gender include all genders.',
            },
            {
                kind: 'paragraph',
                text: 'These Terms shall be interpreted fairly according to their plain meaning and shall not be construed against either party by reason of authorship.',
            },
        ],
    },
    {
        number: '37',
        title: 'Contact Information',
        blocks: [
            {
                kind: 'paragraph',
                text: 'Questions regarding these Terms or the Services may be directed to:',
            },
            { kind: 'contact', label: 'Company', value: 'HitBox Collectibles LLC' },
            {
                kind: 'contact',
                label: 'Email',
                value: 'hitboxcollectibles.admin@gmail.com',
                href: 'mailto:hitboxcollectibles.admin@gmail.com',
            },
        ],
    },
]
