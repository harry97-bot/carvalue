-- CARVALUE seed data (reference/sample rows)

insert into public.badges(name,description,image_url,condition_type,condition_value,rarity,is_active) values ('첫 투표','첫 투표 참여',NULL,'vote_count','1','normal','t');
insert into public.badges(name,description,image_url,condition_type,condition_value,rarity,is_active) values ('투표 장인','투표 100회 참여',NULL,'vote_count','100','rare','t');
insert into public.badges(name,description,image_url,condition_type,condition_value,rarity,is_active) values ('그랜저 오너','그랜저 차량 등록',NULL,'car_brand',NULL,'normal','t');
insert into public.badges(name,description,image_url,condition_type,condition_value,rarity,is_active) values ('소모임 리더','소모임 개설',NULL,'club_owner',NULL,'rare','t');
insert into public.badges(name,description,image_url,condition_type,condition_value,rarity,is_active) values ('베타 테스터','베타 기간 가입',NULL,'special',NULL,'epic','t');

insert into public.shop_items(name,description,item_type,image_url,price_points,rarity,is_limited,is_active) values ('Blue Neon 프레임',NULL,'profile_frame',NULL,500,'rare','f','t');
insert into public.shop_items(name,description,item_type,image_url,price_points,rarity,is_limited,is_active) values ('Carbon 프레임',NULL,'profile_frame',NULL,300,'normal','f','t');
insert into public.shop_items(name,description,item_type,image_url,price_points,rarity,is_limited,is_active) values ('Genesis Gold 프레임',NULL,'profile_frame',NULL,1500,'epic','t','t');
insert into public.shop_items(name,description,item_type,image_url,price_points,rarity,is_limited,is_active) values ('Night City 배경',NULL,'profile_background',NULL,400,'normal','f','t');
insert into public.shop_items(name,description,item_type,image_url,price_points,rarity,is_limited,is_active) values ('Sports 차량카드',NULL,'car_card_skin',NULL,800,'rare','f','t');

insert into public.votes(title,description,category,option_a,option_b,option_a_image_url,option_b_image_url,brand,model,trim,reward_points,is_active) values ('현대 VS 기아',NULL,'brand','현대','기아',NULL,NULL,NULL,NULL,NULL,10,'t');
insert into public.votes(title,description,category,option_a,option_b,option_a_image_url,option_b_image_url,brand,model,trim,reward_points,is_active) values ('HUD VS 통풍시트',NULL,'option','HUD','통풍시트',NULL,NULL,NULL,NULL,NULL,10,'t');
insert into public.votes(title,description,category,option_a,option_b,option_a_image_url,option_b_image_url,brand,model,trim,reward_points,is_active) values ('그랜저 캘리그래피 VS 시그니처',NULL,'trim','캘리그래피','시그니처',NULL,NULL,NULL,'그랜저',NULL,10,'t');
insert into public.votes(title,description,category,option_a,option_b,option_a_image_url,option_b_image_url,brand,model,trim,reward_points,is_active) values ('신형 싼타페 전면부 A VS B',NULL,'design','전면부 A','전면부 B',NULL,NULL,NULL,'싼타페',NULL,10,'t');
insert into public.votes(title,description,category,option_a,option_b,option_a_image_url,option_b_image_url,brand,model,trim,reward_points,is_active) values ('그랜저 VS K8, 당신의 선택은?',NULL,'model','그랜저','K8',NULL,NULL,NULL,NULL,NULL,10,'t');

insert into public.clubs(name,description,category,brand,model,region,cover_image_url,member_count,is_active) values ('그랜저 오너스','그랜저 오너들의 모임','model','현대','그랜저',NULL,NULL,12300,'t');
insert into public.clubs(name,description,category,brand,model,region,cover_image_url,member_count,is_active) values ('EV Club','전기차 충전 꿀팁','interest',NULL,NULL,NULL,NULL,8400,'t');
insert into public.clubs(name,description,category,brand,model,region,cover_image_url,member_count,is_active) values ('경기북부 드라이브','경기북부 드라이브 코스 공유','region',NULL,NULL,'경기',NULL,3200,'t');

insert into public.drive_courses(title,description,region,theme,distance_km,duration_minutes,difficulty,recommended_car_type,image_url,map_url,rating,is_active) values ('북악스카이웨이',NULL,'서울','야경',12,45,'쉬움','세단',NULL,NULL,4.6,'t');
insert into public.drive_courses(title,description,region,theme,distance_km,duration_minutes,difficulty,recommended_car_type,image_url,map_url,rating,is_active) values ('강릉 안반데기',NULL,'강원','산길',28,60,'보통','SUV',NULL,NULL,4.8,'t');
insert into public.drive_courses(title,description,region,theme,distance_km,duration_minutes,difficulty,recommended_car_type,image_url,map_url,rating,is_active) values ('남해 드라이브',NULL,'경상','바다',40,90,'보통','오픈카',NULL,NULL,4.7,'t');

insert into public.partner_links(name,partner_type,url,description,is_active) values ('나우카 신차 견적','nowcar','https://www.xn--910b023bopf.com/m/buildcar/quick.php','신차 장기렌트·리스 견적','t');
insert into public.partner_links(name,partner_type,url,description,is_active) values ('오일나이스 에너지맵','oilnice','https://www.oilnice.com','주유소·충전소 정보','t');