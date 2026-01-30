'use client';

import { useEffect, useState } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function WelcomeTour() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const tourCompleted = localStorage.getItem('student_tour_completed');
    const isMobile = window.innerWidth < 768; 

    if (!tourCompleted) {
      // 1. Definimos los pasos base (los del sidebar)
      const baseSteps = [
        { 
          element: '#sidebar-dashboard', 
          popover: { 
            title: '👋 ¡Bienvenido a AutoClub!', 
            description: 'Este es tu panel principal. Aquí verás un resumen de tus clases.',
            side: isMobile ? "bottom" : "right", 
            align: 'start' 
          } 
        },
        { 
          element: '#sidebar-schedule', 
          popover: { 
            title: '📅 Agenda tus Clases', 
            description: 'Entra aquí para ver horarios disponibles y reservar.',
            side: isMobile ? "bottom" : "right" 
          } 
        },
        { 
          element: '#sidebar-curriculum', 
          popover: { 
            title: '📈 Tu Progreso', 
            description: 'Visualiza tus módulos y licencias antes de empezar.',
            side: isMobile ? "bottom" : "right" 
          } 
        },
        { 
          element: '#sidebar-reservations', 
          popover: { 
            title: 'Historial', 
            description: 'Consulta o cancela tus clases futuras aquí.',
            side: isMobile ? "bottom" : "right" 
          } 
        },
        { 
          popover: { 
            title: '🚀 ¡Todo listo!', 
            description: 'Si tienes dudas, contacta a soporte. ¡Buena suerte!', 
          } 
        }
      ];

      // 2. Si es MÓVIL, agregamos un paso PREVIO para abrir el menú
      let driverSteps = baseSteps;

      if (isMobile) {
        driverSteps = [
          {
            element: '#mobile-menu-btn',
            popover: {
              title: 'Menú de Navegación',
              description: 'Toca este botón para desplegar el menú y ver tus opciones.',
              side: 'bottom',
              // TRUCO: Cuando le den "Siguiente" o toquen el elemento, 
              // forzamos el click en el botón para que el menú se abra sí o sí.
              onNextClick: () => {
                const btn = document.getElementById('mobile-menu-btn');
                if (btn) btn.click();
                
                // Esperamos un poquito a que la animación del menú termine antes de pasar al siguiente paso
                setTimeout(() => {
                   driverObj.moveNext();
                }, 300);
              }
            }
          },
          ...baseSteps
        ];
      }

      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true, 
        doneBtnText: '¡Entendido! 🚗',
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        steps: driverSteps, // Usamos la lista dinámica
        
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || confirm("¿Quieres saltar el tutorial?")) {
            driverObj.destroy();
            localStorage.setItem('student_tour_completed', 'true');
          }
        },
      });

      setTimeout(() => {
        driverObj.drive();
      }, 1000);
    }
  }, [mounted]);

  return null; 
}