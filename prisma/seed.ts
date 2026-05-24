import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Nettoyer les données existantes
    await prisma.question.deleteMany();
    await prisma.sessionSpeaker.deleteMany();
    await prisma.session.deleteMany();
    await prisma.event.deleteMany();
    await prisma.room.deleteMany();
    await prisma.speaker.deleteMany();
    await prisma.user.deleteMany();

    // Organisateur
    const hashedPassword = await bcrypt.hash("Admin1234!", 10);
    const organizer = await prisma.user.create({
        data: {
            email: "admin@eventsync.com",
            password: hashedPassword,
            name: "Alice Martin",
            role: "ORGANIZER",
        },
    });
    console.log("Organisateur créé:", organizer.email);

    // Salles
    const [roomA, roomB, roomC] = await Promise.all([
        prisma.room.create({ data: { name: "Salle Amphi A" } }),
        prisma.room.create({ data: { name: "Salle Amphi B" } }),
        prisma.room.create({ data: { name: "Atelier Innovation" } }),
    ]);
    console.log("Salles créées");

    // Intervenants
    const [speaker1, speaker2, speaker3, speaker4] = await Promise.all([
        prisma.speaker.create({
            data: {
                fullName: "Thomas Dupont",
                bio: "Expert en intelligence artificielle et machine learning avec 10 ans d'expérience. Ancien ingénieur chez Google Brain, Thomas intervient régulièrement dans les grandes conférences tech européennes.",
                profilePhoto:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
                externalLinks: {
                    Twitter: "https://twitter.com",
                    LinkedIn: "https://linkedin.com",
                    Site: "https://example.com",
                },
            },
        }),
        prisma.speaker.create({
            data: {
                fullName: "Sophie Bernard",
                bio: "Architecte cloud et DevOps lead chez Scaleway. Passionnée par les systèmes distribués et la résilience des infrastructures. Co-fondatrice du meetup CloudNative Paris.",
                profilePhoto:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
                externalLinks: {
                    GitHub: "https://github.com",
                    LinkedIn: "https://linkedin.com",
                },
            },
        }),
        prisma.speaker.create({
            data: {
                fullName: "Karim Mansouri",
                bio: "Product Manager senior spécialisé dans les produits data. Ancien consultant McKinsey, il aide les entreprises à transformer leurs données en avantage compétitif.",
                profilePhoto:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Karim",
                externalLinks: {
                    LinkedIn: "https://linkedin.com",
                },
            },
        }),
        prisma.speaker.create({
            data: {
                fullName: "Léa Rousseau",
                bio: "Développeuse full-stack et open source advocate. Contributrice active à React et Next.js. Elle anime des workshops sur le développement web moderne dans toute la France.",
                profilePhoto:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lea",
                externalLinks: {
                    GitHub: "https://github.com",
                    Twitter: "https://twitter.com",
                    Blog: "https://example.com",
                },
            },
        }),
    ]);
    console.log("Intervenants créés");

    // Événement 1 : TechConf 2025 (aujourd'hui)
    const today = new Date();
    const event1 = await prisma.event.create({
        data: {
            title: "TechConf 2025",
            description:
                "La grande conférence tech de l'année ! Deux jours de talks, workshops et networking autour des dernières tendances : IA, cloud, web et product management.",
            startDate: new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
            ),
            endDate: new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + 1,
            ),
            location: "Paris Expo — Porte de Versailles",
            organizerId: organizer.id,
        },
    });

    // Sessions d'aujourd'hui avec une session LIVE maintenant
    const nowHour = today.getHours();
    const nowMin = today.getMinutes();

    function todayAt(h: number, m = 0) {
        return new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            h,
            m,
        );
    }

    // Session LIVE : commence 30 min avant maintenant, finit dans 30 min
    const liveStart = new Date(today.getTime() - 30 * 60 * 1000);
    const liveEnd = new Date(today.getTime() + 30 * 60 * 1000);

    const [session1, session2, session3, session4, session5] =
        await Promise.all([
            // Session LIVE maintenant
            prisma.session.create({
                data: {
                    title: "L'IA générative en production : retours d'expérience",
                    description:
                        "Comment déployer et maintenir des modèles LLM en production ? Thomas partage ses retours après 2 ans de mise en production d'IA générative chez des grands comptes.",
                    startTime: liveStart,
                    endTime: liveEnd,
                    capacity: 200,
                    eventId: event1.id,
                    roomId: roomA.id,
                },
            }),
            // Session dans 1h
            prisma.session.create({
                data: {
                    title: "Kubernetes à grande échelle : patterns et anti-patterns",
                    description:
                        "Sophie présente les architectures Kubernetes qu'elle a vues réussir — et échouer — dans des environnements de production à haute disponibilité.",
                    startTime: new Date(today.getTime() + 60 * 60 * 1000),
                    endTime: new Date(today.getTime() + 120 * 60 * 1000),
                    capacity: 150,
                    eventId: event1.id,
                    roomId: roomB.id,
                },
            }),
            // Session LIVE en parallèle
            prisma.session.create({
                data: {
                    title: "Workshop Next.js 14 : App Router & Server Components",
                    description:
                        "Hands-on workshop pour maîtriser les Server Components, le streaming et les nouvelles conventions de Next.js 14. Ordinateur requis.",
                    startTime: liveStart,
                    endTime: liveEnd,
                    capacity: 30,
                    eventId: event1.id,
                    roomId: roomC.id,
                },
            }),
            // Session passée
            prisma.session.create({
                data: {
                    title: "Data-driven Product Management",
                    description:
                        "Karim présente un framework pratique pour prendre des décisions produit basées sur la data, sans tomber dans le piège du 'data theater'.",
                    startTime: new Date(today.getTime() - 3 * 60 * 60 * 1000),
                    endTime: new Date(today.getTime() - 2 * 60 * 60 * 1000),
                    capacity: 100,
                    eventId: event1.id,
                    roomId: roomA.id,
                },
            }),
            // Session demain
            prisma.session.create({
                data: {
                    title: "Open Source : contribuer et maintenir un projet populaire",
                    description:
                        "Léa partage son expérience de contributrice sur des projets open source majeurs : comment commencer, comment tenir dans la durée, et comment gérer la communauté.",
                    startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    endTime: new Date(today.getTime() + 25 * 60 * 60 * 1000),
                    capacity: 120,
                    eventId: event1.id,
                    roomId: roomB.id,
                },
            }),
        ]);
    console.log("Sessions TechConf créées");

    // Assigner les intervenants aux sessions
    await Promise.all([
        prisma.sessionSpeaker.create({
            data: { sessionId: session1.id, speakerId: speaker1.id },
        }),
        prisma.sessionSpeaker.create({
            data: { sessionId: session2.id, speakerId: speaker2.id },
        }),
        prisma.sessionSpeaker.create({
            data: { sessionId: session3.id, speakerId: speaker4.id },
        }),
        prisma.sessionSpeaker.create({
            data: { sessionId: session4.id, speakerId: speaker3.id },
        }),
        prisma.sessionSpeaker.create({
            data: { sessionId: session5.id, speakerId: speaker4.id },
        }),
        // Session 1 a aussi speaker4 comme co-intervenante
        prisma.sessionSpeaker.create({
            data: { sessionId: session1.id, speakerId: speaker4.id },
        }),
    ]);
    console.log("Intervenants assignés aux sessions");

    // Questions sur la session live
    await Promise.all([
        prisma.question.create({
            data: {
                content:
                    "Quels sont les coûts réels d'exploitation d'un LLM en production ? Avez-vous des chiffres à partager ?",
                authorName: "Marc L.",
                upvotes: 12,
                sessionId: session1.id,
            },
        }),
        prisma.question.create({
            data: {
                content:
                    "Comment gérez-vous les hallucinations du modèle en production ? Avez-vous mis en place des garde-fous ?",
                authorName: "Julie D.",
                upvotes: 8,
                sessionId: session1.id,
            },
        }),
        prisma.question.create({
            data: {
                content:
                    "Quelle différence de latence observez-vous entre GPT-4 et les modèles open source comme Llama ?",
                authorName: null,
                upvotes: 5,
                sessionId: session1.id,
            },
        }),
    ]);
    console.log("Questions créées sur la session live");

    // Événement 2 : WebDev Summit (la semaine prochaine)
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const event2 = await prisma.event.create({
        data: {
            title: "WebDev Summit 2025",
            description:
                "Deux jours dédiés au développement web : frameworks modernes, performance, accessibilité et bonnes pratiques. Pour les développeurs front, back et full-stack.",
            startDate: nextWeek,
            endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
            location: "Station F — Paris 13e",
            organizerId: organizer.id,
        },
    });

    const session6 = await prisma.session.create({
        data: {
            title: "TypeScript avancé : types utilitaires et pattern matching",
            description:
                "Plongée dans les fonctionnalités avancées de TypeScript : types conditionnels, infer, template literal types et l'émergence du pattern matching.",
            startTime: new Date(nextWeek.getTime() + 9 * 60 * 60 * 1000),
            endTime: new Date(nextWeek.getTime() + 10 * 60 * 60 * 1000),
            capacity: 80,
            eventId: event2.id,
            roomId: roomA.id,
        },
    });

    await prisma.sessionSpeaker.create({
        data: { sessionId: session6.id, speakerId: speaker4.id },
    });
    console.log("Événement WebDev Summit créé");

    console.log("\nSeed terminé avec succès !\n");
    console.log("Connexion admin :");
    console.log("   Email    : admin@eventsync.com");
    console.log("   Password : Admin1234!");
}

main()
    .catch((e) => {
        console.error("Erreur seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
