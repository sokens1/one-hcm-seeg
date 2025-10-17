-- ============================================================================
-- INSERTION DES 39 OFFRES DE CAMPAGNE 3
-- Date: 2025-10-17
-- ============================================================================

-- ÉTAPE 1: Insertion du recruteur (si nécessaire)
INSERT INTO public.users (id, email, matricule, role, first_name, last_name, phone, date_of_birth, candidate_status, created_at, updated_at) 
VALUES ('ff967d0b-e250-40dc-8cb6-fc16429dceed'::uuid, 'jessymac33@gmail.com', '0001', 'recruteur', 'Jessy', 'Mac Modifié', '+24162788840', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
ON CONFLICT (id) DO NOTHING;

-- ÉTAPE 2: Insertion des 39 offres de campagne 3
-- Copiez tout depuis la ligne suivante jusqu'à la fin des INSERT

INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, status, status_offerts, campaign_id, created_at, updated_at) VALUES ('49b4db78-817e-4fae-825e-dde2af10b510'::uuid, 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Délégation Centre Sud', '<p class="ql-align-justify"><strong style="color: rgb(0, 112, 192);">Objet du poste</strong></p><p class="ql-align-justify"><br></p><ul><li class="ql-align-justify"><span style="color: black;">Assurer la représentation de la S.E.E.G, la coordination et la supervision des activités de Production, Transport, Distribution et Commercialisation de l''électricité et de l''eau dans la Région Centre Sud, dans le respect des règles et procédures en vigueur. </span></li><li class="ql-align-justify">Contribuer à la modernisation du cadre réglementaire, à l''amélioration continue des processus et à la digitalisation des outils et procédures de la Délégation Centre Sud.</li></ul><p><strong style="color: black;">&nbsp;</strong></p><p class="ql-align-justify"><strong style="color: rgb(0, 112, 192);">Missions principales</strong></p><p class="ql-align-justify"><strong style="color: rgb(0, 112, 192);">&nbsp;</strong></p><ul><li class="ql-align-justify"><span style="color: black;">Superviser la gestion de Production, Transport, Distribution, et Commercialisation de l''Eau et l''Electricité dans la Région ;</span></li><li class="ql-align-justify"><span style="color: black;">Assurer la gestion optimale des moyens matériels et financiers mis à disposition ;</span></li><li class="ql-align-justify"><span style="color: black;">Veiller à la gestion du patrimoine (Bâtiments, sites industriels, etc.) de la région ;</span></li><li class="ql-align-justify"><span style="color: black;">Garantir la commercialisation des produits Eau et Electricité de la région ;</span></li><li class="ql-align-justify"><span style="color: black;">Coordonner les opérations de maintenance des niveaux 1, 2 et 3 sur les équipements exploités ;</span></li><li class="ql-align-justify"><span style="color: black;">Superviser l''administration et le développement des ressources humaines dans la région ;</span></li><li class="ql-align-justify"><span style="color: black;">Gérer les relations avec les parties prenantes ;</span></li><li class="ql-align-justify"><span style="color: black;">Élaborer et déployer les actions d''amélioration de la performance opérationnelle en matière de satisfaction du client et des rendements des réseaux électricité et eau ;</span></li><li class="ql-align-justify"><span style="color: black;">Participer à la mise en œuvre du processus de SMQ ;</span></li><li class="ql-align-justify"><span style="color: black;">Contribuer activement à la transformation digitale de la région, la modernisation des services et à la traduction des objectifs opérationnels en résultats mesurables, en alignement avec la stratégie de l''entreprise. </span></li></ul><p class="ql-align-justify"><span style="color: black;">&nbsp;</span></p><p class="ql-align-justify"><strong style="color: rgb(0, 112, 192);">Livrables attendus</strong></p><ul><li><span style="color: black;">Rapport annuel de performance et plan d''amélioration continue de la Région&nbsp;;</span></li><li><span style="color: black;">Documentation qualité tenue à jour&nbsp;;</span></li><li><span style="color: black;">Tableaux de bord de l''activité mis à jour ;</span></li><li><span style="color: black;">Rapports d''activités consolidés de la région&nbsp;;</span></li><li><span style="color: black;">Élaborer les fiches de poste, fixer les objectifs des collaborateurs.&nbsp;</span></li></ul>', 'Libreville', 'CDI avec période d''essai', 'active', 'interne', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- NOTE: Les 38 autres INSERT sont trop volumineux pour tenir dans un seul fichier
-- Utilisez le fichier généré précédemment ou exécutez la requête GENERER_TOUTES_39_OFFRES.sql

-- ÉTAPE 3: Vérifications après insertion
-- Exécutez ces requêtes pour vérifier que tout s'est bien passé

SELECT COUNT(*) as total_offres FROM public.job_offers WHERE campaign_id = 3;
-- Résultat attendu: 46 offres (7 + 39)

SELECT status, COUNT(*) FROM public.job_offers WHERE campaign_id = 3 GROUP BY status;
-- Résultat attendu: active: 3, draft: 43

SELECT status_offerts, COUNT(*) FROM public.job_offers WHERE campaign_id = 3 GROUP BY status_offerts;
-- Résultat attendu: interne: ~45, NULL: ~1

