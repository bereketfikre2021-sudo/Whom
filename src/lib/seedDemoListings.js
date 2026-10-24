import { supabase } from './supabase';

export const seedDemoListings = async () => {
  try {
    // Get category IDs
    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug')
      .in('slug', ['construction-workers', 'houses-for-rent', 'tutors']);

    if (!categories || categories.length !== 3) {
      console.error('Categories not found');
      return { success: false, error: 'Categories not found' };
    }

    const constructionCat = categories.find(c => c.slug === 'construction-workers');
    const housesCat = categories.find(c => c.slug === 'houses-for-rent');
    const tutorsCat = categories.find(c => c.slug === 'tutors');

    if (!constructionCat || !housesCat || !tutorsCat) {
      console.error('One or more categories missing');
      return { success: false, error: 'Categories missing' };
    }

    // Check if demo listings already exist
    const { data: existingDemos } = await supabase
      .from('listings')
      .select('id')
      .eq('is_demo', true)
      .limit(1);

    if (existingDemos && existingDemos.length > 0) {
      console.log('Demo listings already exist');
      return { success: true, message: 'Demo listings already exist' };
    }

    // Construction Workers
    const constructionListings = [
      {
        category_id: constructionCat.id,
        title: 'General Construction Laborer',
        description: 'Experienced general construction worker available for residential construction and related manual work. Skilled in site preparation, material handling, and general construction tasks. Reliable and hardworking with 4 years of hands-on experience in various construction projects.',
        price: 'Negotiable',
        location: 'Bole, Addis Ababa',
        contact_info: 'DEMO - No real contact info',
        images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop'],
        status: 'active',
        fee_type: 'category',
        featured: true,
        is_demo: true,
        metadata: {
          worker_type: 'General Laborer',
          experience: '4 years',
          skills: ['General construction', 'Site preparation', 'Material handling'],
          availability: 'Full-time'
        }
      },
      {
        category_id: constructionCat.id,
        title: 'Residential Painter',
        description: 'Residential painting specialist with experience preparing and painting interior and exterior surfaces. Expert in surface preparation, color selection advice, and clean application. 5 years of experience in residential painting projects with attention to detail and quality finishes.',
        price: 'Negotiable',
        location: 'Saris, Addis Ababa',
        contact_info: 'DEMO - No real contact info',
        images: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop'],
        status: 'active',
        fee_type: 'category',
        featured: false,
        is_demo: true,
        metadata: {
          worker_type: 'Painter',
          experience: '5 years',
          skills: ['Interior painting', 'Exterior painting', 'Surface preparation'],
          availability: 'Part-time'
        }
      },
      {
        category_id: constructionCat.id,
        title: 'Carpenter and Furniture Maker',
        description: 'Carpenter experienced in basic furniture making, woodwork, door fitting, and household carpentry projects. Skilled in working with various wood types and creating custom pieces. 6 years of experience delivering quality carpentry work for homes and businesses.',
        price: 'Negotiable',
        location: 'Piassa, Addis Ababa',
        contact_info: 'DEMO - No real contact info',
        images: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop'],
        status: 'active',
        fee_type: 'category',
        featured: false,
        is_demo: true,
        metadata: {
          worker_type: 'Carpenter',
          experience: '6 years',
          skills: ['Carpentry', 'Shelves', 'Doors', 'Furniture assembly'],
          availability: 'Full-time'
        }
      }
    ];

    // Houses for Rent
    const houseListings = [
      {
        category_id: housesCat.id,
        title: 'One-Bedroom Apartment in Ayat',
        description: 'Sample one-bedroom rental listing with a dedicated living area and basic property details. This apartment offers comfortable living space in a convenient location. Ideal for individuals or couples looking for a well-maintained rental property.',
        price: 'ETB 8,000/month',
        location: 'Ayat, Addis Ababa',
        contact_info: 'DEMO - No real contact info',
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'],
        status: 'active',
        fee_type: 'category',
        featured: true,
        is_demo: true,
        metadata: {
          bedrooms: 1,
          bathrooms: 1,
          area: '60 sqm',
          property_type: 'Apartment',
          furnished: false,
          facilities: ['Parking', 'Security']
        }
      },
      {
        category_id: housesCat.id,
        title: 'Two-Bedroom Family Apartment',
        description: 'Sample two-bedroom property suitable for people looking for additional living space. This spacious apartment is perfect for small families. Located in a desirable area with good access to amenities and services.',
        price: 'ETB 15,000/month',
        location: 'Summit, Addis Ababa',
        contact_info: 'DEMO - No real contact info',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'],
        status: 'active',
        fee_type: 'category',
        featured: false,
        is_demo: true,
        metadata: {
          bedrooms: 2,
          bathrooms: 2,
          area: '90 sqm',
          property_type: 'Apartment',
          furnished: true,
          facilities: ['Parking', 'Security', 'Balcony']
        }
      },
      {
        category_id: housesCat.id,
        title: 'Compact Studio Rental',
        description: 'Sample compact rental property for someone looking for a smaller living space. This studio apartment is efficient and well-designed, perfect for students or young professionals. Affordable option in a convenient location.',
        price: 'ETB 6,500/month',
        location: 'Megenagna, Addis Ababa',
        contact_info: 'DEMO - No real contact info',
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'],
        status: 'active',
        fee_type: 'category',
        featured: false,
        is_demo: true,
        metadata: {
          bedrooms: 1,
          bathrooms: 1,
          area: '40 sqm',
          property_type: 'Studio',
          furnished: false,
          facilities: ['Security']
        }
      }
    ];

    // Tutors
    const tutorListings = [
      {
        category_id: tutorsCat.id,
        title: 'Mathematics Tutor',
        description: 'Sample tutor profile offering mathematics and basic science learning support. Experienced in helping students understand mathematical concepts and improve problem-solving skills. Patient teaching approach tailored to individual learning needs.',
        price: 'ETB 200/hour',
        location: 'Bole, Addis Ababa',
        contact_info: 'DEMO - No real contact info',
        images: ['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop'],
        status: 'active',
        fee_type: 'category',
        featured: true,
        is_demo: true,
        metadata: {
          subject: 'Mathematics and basic science',
          experience: '4 years',
          grade_level: 'Primary to Secondary',
          qualifications: 'Mathematics Degree',
          teaching_arrangement: 'In-person',
          schedule: 'Weekdays and Weekends'
        }
      },
      {
        category_id: tutorsCat.id,
        title: 'English Language Tutor',
        description: 'Sample tutor profile focused on English language learning and foundational literacy skills. Specialized in teaching reading, writing, and grammar. Helps students build confidence in English communication for academic and professional success.',
        price: 'ETB 150/hour',
        location: 'Kazanchis, Addis Ababa',
        contact_info: 'DEMO - No real contact info',
        images: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=600&fit=crop'],
        status: 'active',
        fee_type: 'category',
        featured: false,
        is_demo: true,
        metadata: {
          subject: 'English reading, writing, and grammar',
          experience: '3 years',
          grade_level: 'All levels',
          qualifications: 'English Literature Degree',
          teaching_arrangement: 'In-person or Online',
          schedule: 'Flexible'
        }
      },
      {
        category_id: tutorsCat.id,
        title: 'Primary School Tutor',
        description: 'Sample tutor profile offering academic support and help with primary school learning. Experienced in teaching multiple subjects at primary school level. Provides homework support and helps students build strong foundational knowledge across subjects.',
        price: 'ETB 180/hour',
        location: 'CMC, Addis Ababa',
        contact_info: 'DEMO - No real contact info',
        images: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop'],
        status: 'active',
        fee_type: 'category',
        featured: false,
        is_demo: true,
        metadata: {
          subject: 'Primary school subjects and homework support',
          experience: '5 years',
          grade_level: 'Primary School (Grades 1-8)',
          qualifications: 'Education Degree',
          teaching_arrangement: 'In-person',
          schedule: 'After school hours'
        }
      }
    ];

    // Insert all listings
    const allListings = [...constructionListings, ...houseListings, ...tutorListings];
    
    const { data: insertedListings, error: insertError } = await supabase
      .from('listings')
      .insert(allListings)
      .select();

    if (insertError) {
      console.error('Error inserting demo listings:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log(`Successfully seeded ${insertedListings.length} demo listings`);
    return { success: true, count: insertedings.length };
  } catch (error) {
    console.error('Error seeding demo listings:', error);
    return { success: false, error: error.message };
  }
};
